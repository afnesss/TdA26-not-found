import {
  cloneCourse,
  getCourseDashboardAnalytics,
  getCourses,
  updateCourse,
} from '@/api/queries/courseQueries'
import SearchBar from '@/components/shared/SearchBar'
import StateComp from '@/components/shared/StateComp'
import HintPageText from '@/components/shared/HintPageText'
import FilterDropdown from '@/components/shared/FilterDropdown'
import { Button } from '@/components/ui/button'
import {
  colorStyles,
  defaultStatusFilters,
  statusFilterItems,
  type FilterIds,
} from '@/lib/constants'
import type {
  CourseDashboardAnalytics,
  CourseStatus,
  CourseSummary,
} from '@/lib/schemas'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  BookOpenText,
  CheckCircle2,
  Download,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CourseComponent from '../../components/shared/CourseComponent'
import {
  filterCourses,
  sortCoursesByFilter,
} from '../CoursePage/utils/helperFunctions'
import CoursesPageSceleton from '../../components/shared/loadingskeleton/CoursesSceleton'
import { toast } from 'sonner'
import { useTitle } from '@/lib/dynamicTitleHook'
import {
  useCloneCourseMutation,
  useCreateCourseMutation,
  useDeleteCourseMutation,
} from '../CoursePage/utils/useCourseMutation'
import { useMediaQuery } from 'usehooks-ts'
import { filterItems } from '@/lib/constants'
import { useDashboardCoursesSSE } from '@/api/useDashboardCoursesSSE'
import { useCoursePlanning } from '@/pages/CoursePage/utils/useCoursePlanning'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { ApiError } from '@/lib/types'
import DashboardModeTabs from './components/DashboardModeTabs'
import DonutOverviewSection from '@/components/shared/Statistics/DonutOverviewSection'
import { CourseStateBadge } from '@/components/shared/CourseStateBadge'
import AnalyticsAttentionAlert from './components/AnalyticsAttentionAlert'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const DASHBOARD_PAGE_FILTERS_KEY = 'dashboard-page-filters'

const DashboardDesign1 = () => {
  const analyticsAllowedStatuses: CourseStatus[] = [
    'live',
    'paused',
    'archived',
  ]
  const isAnalyticsAllowedStatus = (status: CourseStatus) =>
    analyticsAllowedStatuses.includes(status)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedFilter, setSelectedFilter] = useLocalStorage<FilterIds>(
    `${DASHBOARD_PAGE_FILTERS_KEY}-sort`,
    'newest',
  )
  const [statusFilters, setStatusFilters] = useLocalStorage<
    Record<CourseStatus, boolean>
  >(`${DASHBOARD_PAGE_FILTERS_KEY}-status`, defaultStatusFilters)

  const [dashboardMode, setDashboardMode] = useState<
    'content' | 'analytics' | 'global'
  >('content')

  const [courseDraft, setCourseDraft] = useState<CourseSummary | null>(null)
  const [displayCount, setDisplayCount] = useState(9)
  const isMd = useMediaQuery('(min-width: 768px)')

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    isRefetchError: coursesRefetchError,
    error: coursesQueryError,
    refetch: refetchCourses,
  } = useQuery<CourseSummary[], ApiError>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    networkMode: 'always',
  })

  const { mutateAsync: deleteCourseMutation } = useDeleteCourseMutation()
  const { mutateAsync: createCourseMutation } =
    useCreateCourseMutation(setCourseDraft)
  const { mutateAsync: cloneCourseMutation } = useCloneCourseMutation()

  const invalidateCourseQueries = (courseId: string) => {
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    queryClient.invalidateQueries({ queryKey: ['courses-user'] })
    queryClient.invalidateQueries({ queryKey: ['course', courseId] })
  }
  const { isConnected } = useDashboardCoursesSSE()

  const handleStatusChange = async (
    courseId: string,
    newStatus: CourseStatus,
  ) => {
    await planning.handleStatusChange(courseId, newStatus, courses)
  }

  const searchFilteredCourses = filterCourses(courses, searchQuery)
  const filteredCourses = searchFilteredCourses.filter(
    (course) => statusFilters[course.status],
  )
  const sortedCourses = sortCoursesByFilter(filteredCourses, selectedFilter)
  const allAnalyticsCourses = courses.filter((course) =>
    isAnalyticsAllowedStatus(course.status),
  )
  const analyticsCourses = sortedCourses.filter((course) =>
    isAnalyticsAllowedStatus(course.status),
  )
  const coursesForCurrentMode =
    dashboardMode === 'analytics' ? analyticsCourses : sortedCourses

  const hasMoreCourses = coursesForCurrentMode.length > displayCount
  const displayedCourses = coursesForCurrentMode.slice(0, displayCount)
  const globalCourses = allAnalyticsCourses
  const courseAnalyticsQueries = useQueries({
    queries: globalCourses.map((course) => ({
      queryKey: ['course-dashboard-analytics', course.uuid],
      queryFn: () => getCourseDashboardAnalytics(course.uuid),
      enabled: dashboardMode === 'global',
    })),
  })

  const loadedAnalytics = courseAnalyticsQueries
    .map((query) => query.data)
    .filter(
      (analytics): analytics is CourseDashboardAnalytics =>
        analytics !== undefined,
    )

  const globalStats = loadedAnalytics.reduce(
    (acc, analytics) => {
      acc.modulesCount += analytics.modulesCount
      acc.materialsCount += analytics.materialsCount
      acc.quizzesCount += analytics.quizzesCount
      acc.quizzesWithoutSubmits += analytics.quizzesWithoutSubmits
      acc.downloadCount += analytics.downloadCount
      acc.copyCount += analytics.copyCount
      acc.openCount += analytics.openCount
      acc.fileMaterialsCount += analytics.modules.reduce(
        (sum, module) => sum + module.fileMaterialsCount,
        0,
      )
      acc.urlMaterialsCount += analytics.modules.reduce(
        (sum, module) => sum + module.urlMaterialsCount,
        0,
      )
      acc.modulesWithoutInteraction += analytics.modulesWithoutInteraction
      acc.lowScoreQuizzes += analytics.lowScoreQuizzes

      const courseQuizAttempts = analytics.modules.reduce(
        (sum, module) => sum + module.quizAttempts,
        0,
      )
      const courseQuizWeightedSum = analytics.modules.reduce((sum, module) => {
        if (module.averageQuizPercentage == null || module.quizAttempts === 0) {
          return sum
        }
        return sum + module.averageQuizPercentage * module.quizAttempts
      }, 0)

      if (courseQuizAttempts > 0) {
        acc.quizScoreWeightedSum += courseQuizWeightedSum
        acc.quizScoreWeight += courseQuizAttempts
      }

      return acc
    },
    {
      modulesCount: 0,
      materialsCount: 0,
      fileMaterialsCount: 0,
      urlMaterialsCount: 0,
      quizzesCount: 0,
      quizzesWithoutSubmits: 0,
      downloadCount: 0,
      copyCount: 0,
      openCount: 0,
      modulesWithoutInteraction: 0,
      lowScoreQuizzes: 0,
      quizScoreWeightedSum: 0,
      quizScoreWeight: 0,
    },
  )

  const globalCourseStatusCounts = courses.reduce(
    (acc, course) => {
      if (course.status === 'draft') acc.draft += 1
      if (course.status === 'planned') acc.planned += 1
      if (course.status === 'live') acc.live += 1
      if (course.status === 'paused') acc.paused += 1
      if (course.status === 'archived') acc.archived += 1
      return acc
    },
    { draft: 0, planned: 0, live: 0, paused: 0, archived: 0 },
  )

  const allAttentionItems = [
    // Critical — broken content state
    {
      label: 'Live kurzy bez modulů',
      value: globalCourses.filter(
        (c) =>
          c.status === 'live' &&
          /* you'd need moduleCount on CourseSummary or derive from analytics */ 0,
      ).length,
      severity: 'critical' as const,
      hint: 'Kurz je živý, ale nemá žádný obsah',
    },
    // High — nobody is submitting anything
    {
      label: 'Kvízy bez submitu',
      value: globalStats.quizzesWithoutSubmits,
      severity:
        globalStats.quizzesCount > 0 &&
        globalStats.quizzesWithoutSubmits === globalStats.quizzesCount
          ? ('critical' as const)
          : ('warning' as const),
    },
    // Warning — engagement gaps
    {
      label: 'Moduly bez interakce',
      value: globalStats.modulesWithoutInteraction,
      severity: 'warning' as const,
    },
    {
      label: 'Kvízy s nízkým skóre',
      value: globalStats.lowScoreQuizzes,
      severity: 'warning' as const,
      hint: 'Průměrné skóre pod 60 %',
    },
  ].filter((item) => item.value > 0)

  const planning = useCoursePlanning({ queryClient })
  const globalAverageQuizPercentage =
    globalStats.quizScoreWeight > 0
      ? globalStats.quizScoreWeightedSum / globalStats.quizScoreWeight
      : null
  const formatMetric = (value: number) =>
    Number.isInteger(value) ? value.toString() : value.toFixed(1)
  const globalAttentionItems = [
    {
      label: 'Moduly bez interakce',
      value: globalStats.modulesWithoutInteraction,
    },
    {
      label: 'Kvízy s nízkým skóre',
      value: globalStats.lowScoreQuizzes,
    },
    {
      label: 'Kvízy bez submitu',
      value: globalStats.quizzesWithoutSubmits,
    },
  ].filter((item) => item.value > 0)
  const globalStatsLoading =
    dashboardMode === 'global' &&
    courseAnalyticsQueries.some((query) => query.isLoading || query.isFetching)
  const dashboardTabs: Array<{
    value: 'content' | 'analytics' | 'global'
    label: string
    disabled?: boolean
  }> = [
    { value: 'content', label: 'Obsah' },
    {
      value: 'analytics',
      label: 'Statistiky',
      disabled: analyticsCourses.length === 0,
    },
    {
      value: 'global',
      label: 'Globalní Statistiky',
      disabled: globalCourses.length === 0,
    },
  ]

  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const resetStatusFilters = () => {
    setStatusFilters(defaultStatusFilters)
  }

  const handleEditCourse = (course: CourseSummary) => {
    // navigate(`/dashboard/${course.uuid}#details`)
    navigate(`/dashboard/${course.uuid}`)
  }

  const handleAddCourse = () => {
    const newDraft: CourseSummary = {
      uuid: 'testid',
      name: '',
      description: '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCourseDraft(newDraft)
  }

  const createButton = (mobile?: boolean) => (
    <Button
      variant='primary'
      size='grid'
      className={mobile ? 'px-3 shrink-0' : ''}
      onClick={handleAddCourse}
      aria-label='Vytvořit kurz'
    >
      <Plus className='w-5 h-5' aria-hidden='true' />
      {!mobile && <span className='whitespace-nowrap'>Vytvořit kurz</span>}
    </Button>
  )

  useTitle('Správa kurzů')

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const isNetworkError =
    (coursesQueryError as ApiError | undefined)?.isNetworkError ?? false
  const hasCourseFetchError = coursesError || coursesRefetchError
  const shouldShowNetworkError =
    hasCourseFetchError && (isNetworkError || isOffline) && courses.length === 0

  const isSearchEmpty = searchQuery.trim() === ''
  const useResetStatusAction = isSearchEmpty && courses.length > 0
  return (
    <>
      <div className='max-w-7xl mx-auto'>
        <div className='space-y-4'>
          <div className='flex flex-row justify-center items-center'>
            <HintPageText
              text='Správa kurzů'
              icon={BookOpenText}
              spanText={
                (searchQuery && filteredCourses.length.toString()) ||
                courses.length.toString()
              }
              className='hidden lg:inline-flex'
            />
            <FilterDropdown
              items={filterItems}
              selectedValue={selectedFilter}
              onSelect={setSelectedFilter}
              statusCheckboxes={statusFilterItems.map((item) => ({
                label: item.label,
                value: item.value,
                checked: statusFilters[item.value],
                onCheckedChange: (checked) => {
                  setStatusFilters((prev) => ({
                    ...prev,
                    [item.value]: checked,
                  }))
                },
              }))}
              align={isMd ? 'center' : 'start'}
              width='w-35 md:w-40'
            />
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              count={
                (searchQuery && filteredCourses.length.toString()) ||
                courses.length.toString()
              }
              className='flex-1 lg:flex-initial'
            />
            <span className='lg:hidden ml-3'>{createButton(true)}</span>
            <span className='hidden lg:inline ml-3'>{createButton(false)}</span>
          </div>

          <DashboardModeTabs
            value={dashboardMode}
            tabs={dashboardTabs}
            onChange={setDashboardMode}
          />

          {coursesLoading ? (
            <CoursesPageSceleton />
          ) : dashboardMode === 'global' ? (
            <div>
              {globalCourses.length === 0 ? (
                <StateComp
                  type='no-content'
                  message='Statistiky jsou dostupné pouze pro live, paused a archived kurzy'
                />
              ) : globalStatsLoading ? (
                <CoursesPageSceleton />
              ) : (
                <div className='rounded-2xl bg-card/90 shadow-sm overflow-hidden'>
                  <div
                    className={cn(
                      'h-1.5 bg-linear-to-r',
                      colorStyles.gradient['accent-teal'],
                    )}
                  />

                  <div className='p-4 md:p-5 space-y-4'>
                    {/* 1. HEADER */}
                    <div className='flex items-center justify-between gap-2'>
                      <Label size='lg' className='font-bold'>
                        Souhrn všech kurzů
                      </Label>
                      <span className='rounded-full bg-accent-teal-dark/10 px-2 py-0.5 text-sm font-semibold text-accent-teal-dark'>
                        Celkem {courses.length}
                      </span>
                    </div>

                    {/* 2. STATUS ROW */}
                    <div className='grid grid-cols-6 gap-2 md:grid-cols-5'>
                      {[
                        {
                          status: 'draft' as const,
                          value: globalCourseStatusCounts.draft,
                          stateClassName: 'brightness-90 saturate-150',
                        },
                        {
                          status: 'planned' as const,
                          value: globalCourseStatusCounts.planned,
                        },
                        {
                          status: 'live' as const,
                          value: globalCourseStatusCounts.live,
                        },
                        {
                          status: 'paused' as const,
                          value: globalCourseStatusCounts.paused,
                        },
                        {
                          status: 'archived' as const,
                          value: globalCourseStatusCounts.archived,
                          stateClassName: 'brightness-90 saturate-150',
                        },
                      ].map(({ status, value, stateClassName = '' }, index) => (
                        <div
                          key={status}
                          className={cn(
                            'flex flex-wrap items-center justify-center sm:justify-between gap-2 rounded-lg bg-muted px-2.5 py-1.5 md:col-span-1',
                            index < 3 ? 'col-span-2' : 'col-span-3',
                          )}
                        >
                          <CourseStateBadge
                            status={status}
                            className={cn(
                              'px-1.5 py-0.5 text-[10px] md:px-2 md:text-xs',
                              stateClassName,
                            )}
                          />
                          <span className='text-sm font-semibold leading-none text-foreground tabular-nums'>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className='flex gap-3 items-stretch'>
                      <div className='basis-2/5'>
                        <DonutOverviewSection
                          percent={Math.min(
                            100,
                            Math.max(0, globalAverageQuizPercentage ?? 0),
                          )}
                          centerValue={
                            globalAverageQuizPercentage === null
                              ? '—'
                              : `${formatMetric(globalAverageQuizPercentage)}%`
                          }
                          footerLabel='Průměrné skóre'
                          footerSubLabel={`${globalStats.quizScoreWeight} odeslání`}
                          className='h-full w-full'
                        />
                      </div>

                      <div className='flex flex-col gap-1.5 basis-3/5'>
                        <div className='rounded-lg flex flex-col items-center justify-center bg-muted py-1.5 px-1'>
                          <span className='text-base font-semibold leading-none text-foreground tabular-nums'>
                            {globalStats.modulesCount}
                          </span>
                          <span className='text-xs md:text-sm mt-0.5 text-muted-foreground'>
                            Moduly
                          </span>
                        </div>

                        <div className='grid grid-cols-2 gap-1.5 flex-1'>
                          <div className='rounded-lg flex flex-col items-center justify-center bg-muted py-1.5 px-1'>
                            <span className='text-sm md:text-base font-semibold leading-none text-foreground tabular-nums'>
                              {globalStats.materialsCount}
                            </span>
                            <span className='text-xs md:text-sm mt-0.5 text-muted-foreground'>
                              Materiály
                            </span>
                            <div className='mt-1 flex items-center gap-2 text-xs md:text-sm text-muted-foreground'>
                              <span className='inline-flex items-center gap-1'>
                                <Download className='h-3 w-3' />
                                <span className='tabular-nums text-primary font-semibold'>
                                  {globalStats.downloadCount}
                                </span>
                              </span>
                              <span className='inline-flex items-center gap-1'>
                                <Copy className='h-3 w-3' />
                                <span className='tabular-nums text-primary font-semibold'>
                                  {globalStats.copyCount}
                                </span>
                              </span>
                              <span className='inline-flex items-center gap-1'>
                                <ExternalLink className='h-3 w-3' />
                                <span className='tabular-nums text-primary font-semibold'>
                                  {globalStats.openCount}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className='rounded-lg flex flex-col items-center justify-center bg-muted py-1.5 px-1'>
                            <span className='text-sm md:text-base font-semibold leading-none text-foreground tabular-nums'>
                              {globalStats.quizzesCount}
                            </span>
                            <span className='text-xs md:text-sm mt-0.5 text-muted-foreground'>
                              Kvízy
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. ATTENTION BAR */}
                    {globalAttentionItems.length > 0 ? (
                      <AnalyticsAttentionAlert
                        className='mt-0 rounded-lg px-2.5 py-1.5 text-xs'
                        messages={globalAttentionItems.map(
                          (item) => `${item.label}: ${item.value}`,
                        )}
                      />
                    ) : (
                      <div className='rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-1.5 bg-secondary/10 text-accent-teal-light'>
                        <CheckCircle2 className='w-3.5 h-3.5 shrink-0' />
                        <span className='font-medium'>
                          Bez kritických signálů
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {dashboardMode === 'analytics' &&
              displayedCourses.length === 0 ? (
                <StateComp
                  type='no-content'
                  message='Žádné kurzy ve stavu live, paused nebo archived'
                />
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 '>
                  {courseDraft && dashboardMode !== 'analytics' && (
                    <CourseComponent
                      key={courseDraft.uuid}
                      course={courseDraft}
                      index={0}
                      type='edit'
                      isDraft
                      onSaveDraft={async (data) => {
                        createCourseMutation(data)
                      }}
                      onEdit={() => {
                        handleEditCourse(courseDraft)
                      }}
                      onCancelDraft={() => setCourseDraft(null)}
                    />
                  )}

                  {displayedCourses.map((course, index) => {
                    const planningState = planning.createPlanningState(course)
                    return (
                      <CourseComponent
                        key={
                          course.uuid ?? (course as CourseSummary).uuid ?? index
                        }
                        course={course}
                        index={courseDraft ? index + 1 : index}
                        type='edit'
                        analyticsMode={
                          dashboardMode === 'analytics' &&
                          isAnalyticsAllowedStatus(course.status)
                        }
                        onEdit={() => {
                          handleEditCourse(course)
                        }}
                        onDelete={() => deleteCourseMutation(course.uuid)}
                        onStatusChange={handleStatusChange}
                        planning={planningState}
                        onCopyAsDraft={async (source: CourseSummary) => {
                          cloneCourseMutation({ source })
                        }}
                      />
                    )
                  })}
                </div>
              )}

              {hasMoreCourses && (
                <div className='mt-4 text-center'>
                  <Button
                    variant='primary'
                    size='primary'
                    onClick={loadMoreCourses}
                    aria-label='Načíst další kurzy'
                  >
                    Načíst další kurzy
                  </Button>
                </div>
              )}
            </>
          )}

          {!courseDraft &&
            (shouldShowNetworkError ? (
              <StateComp
                type='network-offline'
                onAction={() => refetchCourses()}
              />
            ) : !coursesLoading && !coursesError && courses.length === 0 ? (
              <StateComp
                type='no-content'
                message='Začněte vytvořením svého prvního kurzu'
              />
            ) : coursesError ? (
              <StateComp
                type={shouldShowNetworkError ? 'network-offline' : 'error'}
                onAction={() => refetchCourses()}
                message={
                  shouldShowNetworkError
                    ? undefined
                    : 'Nepodařilo se načíst kurzy'
                }
              />
            ) : (
              filteredCourses.length === 0 &&
              !coursesLoading && (
                <StateComp
                  type='empty-search'
                  onAction={() => {
                    if (useResetStatusAction) {
                      resetStatusFilters()
                      return
                    }
                    setSearchQuery('')
                  }}
                  actionText={
                    useResetStatusAction ? 'Zrušit filtry' : undefined
                  }
                />
              )
            ))}
        </div>
      </div>
    </>
  )
}

export default DashboardDesign1
