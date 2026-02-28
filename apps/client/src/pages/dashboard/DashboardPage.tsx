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
import { Plus, BookOpenText } from 'lucide-react'
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

const DASHBOARD_PAGE_FILTERS_KEY = 'dashboard-page-filters'

const DashboardDesign1 = () => {
  const analyticsAllowedStatuses: CourseStatus[] = ['live', 'paused', 'archived']
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

  const planning = useCoursePlanning({ queryClient })

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
  const analyticsCourses = sortedCourses.filter((course) =>
    isAnalyticsAllowedStatus(course.status),
  )
  const coursesForCurrentMode =
    dashboardMode === 'analytics' ? analyticsCourses : sortedCourses

  const hasMoreCourses = coursesForCurrentMode.length > displayCount
  const displayedCourses = coursesForCurrentMode.slice(0, displayCount)
  const globalCourses = analyticsCourses
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

  const globalAverageQuizPercentage =
    globalStats.quizScoreWeight > 0
      ? globalStats.quizScoreWeightedSum / globalStats.quizScoreWeight
      : null
  const formatMetric = (value: number) =>
    Number.isInteger(value) ? value.toString() : value.toFixed(1)
  const globalStatsLoading =
    dashboardMode === 'global' &&
    courseAnalyticsQueries.some((query) => query.isLoading || query.isFetching)

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
        <div className='space-y-6 pt-3'>
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

          <div className='flex gap-2'>
            <Button
              variant='filter'
              size='sm'
              className='rounded-xl'
              onClick={() => setDashboardMode('content')}
            >
              Obsah
            </Button>
            <Button
              variant='filter'
              size='sm'
              className='rounded-xl'
              onClick={() => setDashboardMode('analytics')}
              disabled={!displayedCourses.some((c) => isAnalyticsAllowedStatus(c.status))}
            >
              Analytika
            </Button>
            <Button
              variant='filter'
              size='sm'
              className='rounded-xl'
              onClick={() => setDashboardMode('global')}
              disabled={globalCourses.length === 0}
            >
              Global
            </Button>
          </div>

          {coursesLoading ? (
            <CoursesPageSceleton />
          ) : dashboardMode === 'global' ? (
            <div className='mt-6'>
              {globalCourses.length === 0 ? (
                <StateComp
                  type='no-content'
                  message='Statistiky jsou dostupné pouze pro live, paused a archived kurzy'
                />
              ) : globalStatsLoading ? (
                <CoursesPageSceleton />
              ) : (
                <div className='rounded-2xl border bg-card/90 p-6 md:p-7 shadow-sm space-y-6'>
                  <div className='flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                        Global Analytics
                      </p>
                      <h3 className='text-2xl font-semibold'>
                        Souhrn všech kurzů
                      </h3>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Kurzy v souhrnu: {globalCourses.length}
                    </p>
                  </div>

                  <div className='grid grid-cols-2 lg:grid-cols-5 gap-3'>
                    <div className='rounded-xl border bg-background/60 p-4'>
                      <p className='text-xs text-muted-foreground'>Moduly</p>
                      <p className='text-2xl font-semibold leading-tight'>
                        {globalStats.modulesCount}
                      </p>
                    </div>
                    <div className='rounded-xl border bg-background/60 p-4'>
                      <p className='text-xs text-muted-foreground'>Materiály</p>
                      <p className='text-2xl font-semibold leading-tight'>
                        {globalStats.materialsCount}
                      </p>
                    </div>
                    <div className='rounded-xl border bg-background/60 p-4'>
                      <p className='text-xs text-muted-foreground'>Kvízy</p>
                      <p className='text-2xl font-semibold leading-tight'>
                        {globalStats.quizzesCount}
                      </p>
                    </div>
                    <div className='rounded-xl border bg-background/60 p-4 col-span-2 lg:col-span-2'>
                      <p className='text-xs text-muted-foreground'>
                        Průměrné skóre kvízů
                      </p>
                      <p className='text-2xl font-semibold leading-tight'>
                        {globalAverageQuizPercentage === null
                          ? '—'
                          : `${formatMetric(globalAverageQuizPercentage)}%`}
                      </p>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='rounded-xl border bg-background/60 p-4'>
                      <p className='text-xs text-muted-foreground'>
                        Submity kvízů
                      </p>
                      <p className='text-2xl font-semibold leading-tight'>
                        {globalStats.quizScoreWeight}
                      </p>
                    </div>
                    <div className='rounded-xl border bg-background/60 p-4'>
                      <p className='text-xs text-muted-foreground'>
                        Kvízy bez submitu
                      </p>
                      <p className='text-2xl font-semibold leading-tight'>
                        {globalStats.quizzesWithoutSubmits}
                      </p>
                    </div>
                  </div>

                  {(globalStats.modulesWithoutInteraction > 0 ||
                    globalStats.lowScoreQuizzes > 0) && (
                    <div className='flex flex-wrap gap-2'>
                      {globalStats.modulesWithoutInteraction > 0 && (
                        <div className='rounded-full border px-3 py-1.5 text-sm'>
                          Moduly bez interakce:{' '}
                          <span className='font-semibold'>
                            {globalStats.modulesWithoutInteraction}
                          </span>
                        </div>
                      )}
                      {globalStats.lowScoreQuizzes > 0 && (
                        <div className='rounded-full border px-3 py-1.5 text-sm'>
                          Kvízy s nízkým skóre:{' '}
                          <span className='font-semibold'>
                            {globalStats.lowScoreQuizzes}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {dashboardMode === 'analytics' && displayedCourses.length === 0 ? (
                <StateComp
                  type='no-content'
                  message='Žádné kurzy ve stavu live, paused nebo archived'
                />
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6 lg:mt-7'>
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
                <div className='mt-8 text-center'>
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
