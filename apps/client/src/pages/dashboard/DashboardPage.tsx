import {
  getCourseDashboardAnalytics,
  getCourses,
} from '@/api/queries/courseQueries'
import { useDashboardCoursesSSE } from '@/api/useDashboardCoursesSSE'
import FilterDropdown from '@/components/shared/FilterDropdown'
import CourseBackupActionsDropdown from '@/components/shared/CourseBackupActionsDropdown'
import HintPageText from '@/components/shared/HintPageText'
import SearchBar from '@/components/shared/SearchBar'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import {
  defaultStatusFilters,
  filterItems,
  statusFilterItems,
  type FilterIds,
} from '@/lib/constants'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgDashboardCoursePath } from '@/lib/routes'
import type { CourseStatus, CourseSummary } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useCoursePlanning } from '@/pages/CoursePage/utils/useCoursePlanning'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, BookOpenText, ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useMediaQuery } from 'usehooks-ts'
import CourseComponent from '../../components/shared/CourseComponent'
import CoursesPageSceleton from '../../components/shared/loadingskeleton/CoursesSceleton'
import {
  filterCourses,
  sortCoursesByFilter,
} from '../CoursePage/utils/helperFunctions'
import {
  useCloneCourseMutation,
  useCreateCourseMutation,
  useDeleteCourseMutation,
} from '../CoursePage/utils/useCourseMutation'
import DashboardModeTabs from './components/DashboardModeTabs'

const DASHBOARD_PAGE_FILTERS_KEY = 'dashboard-page-filters'

const DashboardDesign1 = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedFilter, setSelectedFilter] = useLocalStorage<FilterIds>(
    `${DASHBOARD_PAGE_FILTERS_KEY}-sort`,
    'newest',
  )
  const [statusFilters, setStatusFilters] = useLocalStorage<
    Record<CourseStatus, boolean>
  >(`${DASHBOARD_PAGE_FILTERS_KEY}-status`, defaultStatusFilters)

  const [dashboardMode, setDashboardMode] = useLocalStorage<
    'content' | 'analytics'
  >('dashboard-analytics-mode', 'content')
  const [showMobileActions, setShowMobileActions] = useState(false)

  const [courseDraft, setCourseDraft] = useState<CourseSummary | null>(null)
  const [displayCount, setDisplayCount] = useState(9)
  const isMd = useMediaQuery('(min-width: 768px)')
  const { orgSlug } = useParams<{ orgSlug?: string }>()

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
    queryFn: () => getCourses(false, orgSlug),
    networkMode: 'always',
  })

  const { mutateAsync: deleteCourseMutation } = useDeleteCourseMutation(orgSlug)
  const { mutateAsync: createCourseMutation } = useCreateCourseMutation(
    setCourseDraft,
    orgSlug,
  )
  const { mutateAsync: cloneCourseMutation } = useCloneCourseMutation(
    {
      skipInvalidateCourses: true,
      optimisticInsert: (previous, optimistic) =>
        sortCoursesByFilter([optimistic, ...(previous ?? [])], selectedFilter),
    },
    orgSlug,
  )

  const { isConnected } = useDashboardCoursesSSE(orgSlug)

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

  const hasMoreCourses = sortedCourses.length > displayCount
  const displayedCourses = sortedCourses.slice(0, displayCount)
  const displayedStatisticsQueries = useQueries({
    queries: displayedCourses.map((course) => ({
      queryKey: ['course-dashboard-analytics', course.uuid],
      queryFn: () => getCourseDashboardAnalytics(course.uuid, orgSlug),
      enabled: dashboardMode === 'analytics',
      staleTime: 1000 * 20,
    })),
  })

  const isStatisticsModeLoading =
    dashboardMode === 'analytics' &&
    displayedCourses.length > 0 &&
    displayedStatisticsQueries.some(
      (query) => query.isLoading && query.data === undefined,
    )

  const planning = useCoursePlanning({ queryClient, orgSlug })

  const dashboardTabs: Array<{
    value: 'content' | 'statistics' | 'global'
    label: string
    disabled?: boolean
  }> = [
    { value: 'content', label: 'Obsah' },
    {
      value: 'statistics',
      label: 'Statistiky',
      disabled: sortedCourses.length === 0,
    },
  ]
  const dashboardTabsValue =
    dashboardMode === 'analytics' ? 'statistics' : 'content'

  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const resetStatusFilters = () => {
    setStatusFilters(defaultStatusFilters)
  }

  const handleEditCourse = (course: CourseSummary) => {
    navigate(buildOrgDashboardCoursePath(orgSlug, course.uuid))
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

  const handleCopyAsDraft = (source: CourseSummary) => {
    void cloneCourseMutation({ source })
  }

  const createButton = (mobile?: boolean) => (
    <Button
      variant='primary'
      size='grid'
      disabled={dashboardMode === 'analytics'}
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
  const statusFilterCheckboxes = statusFilterItems.map((item) => ({
    label: item.label,
    value: item.value,
    checked: statusFilters[item.value],
    onCheckedChange: (checked: boolean) => {
      setStatusFilters((prev) => ({
        ...prev,
        [item.value]: checked,
      }))
    },
  }))

  return (
    <>
      <div className='max-w-7xl mx-auto'>
        <div className='space-y-4 md:space-y-5'>
          <div className='flex flex-col gap-3 sm:hidden'>
            <div className='flex items-center gap-2 w-full'>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                count={
                  (searchQuery && filteredCourses.length.toString()) ||
                  courses.length.toString()
                }
                className='flex-1 min-w-0'
              />
              <span className='shrink-0'>{createButton(true)}</span>
            </div>
            <button
              type='button'
              className='self-center inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline'
              onClick={() => setShowMobileActions((prev) => !prev)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showMobileActions ? 'rotate-180' : ''}`}
              />
              {showMobileActions ? 'Zavřít další' : 'Otevřít další'}
            </button>
            {showMobileActions && (
              <div className='flex items-center justify-center gap-4 flex-wrap'>
                <DashboardModeTabs
                  value={dashboardTabsValue}
                  tabs={dashboardTabs}
                  onChange={(next) =>
                    setDashboardMode(
                      next === 'statistics' ? 'analytics' : 'content',
                    )
                  }
                  className='shrink-0'
                />
                <FilterDropdown
                  items={filterItems}
                  selectedValue={selectedFilter}
                  onSelect={setSelectedFilter}
                  statusCheckboxes={statusFilterCheckboxes}
                  align='center'
                  width='w-35 md:w-40'
                  triggerClassName='bg-background text-primary h-8.5 md:h-10 w-auto hover:bg-gray-50 border border-gray-200 shrink-0 px-3'
                  triggerLabel='Filtry'
                />
                <CourseBackupActionsDropdown
                  className='rounded-xl px-3 h-8.5 md:h-10'
                  triggerLabel='Export / import'
                />
              </div>
            )}
          </div>
          <div className='hidden sm:flex sm:items-center sm:justify-center sm:gap-2 md:gap-3'>
            <div className='hidden lg:flex'>
              <HintPageText
                text={
                  dashboardMode === 'analytics'
                    ? 'Statistiky kurzů'
                    : 'Správa kurzů'
                }
                icon={dashboardMode === 'analytics' ? BarChart3 : BookOpenText}
                spanText={
                  (searchQuery && filteredCourses.length.toString()) ||
                  courses.length.toString()
                }
              />
            </div>
            <DashboardModeTabs
              value={dashboardTabsValue}
              tabs={dashboardTabs}
              onChange={(next) =>
                setDashboardMode(
                  next === 'statistics' ? 'analytics' : 'content',
                )
              }
              className='shrink-0'
            />
            <FilterDropdown
              items={filterItems}
              selectedValue={selectedFilter}
              onSelect={setSelectedFilter}
              statusCheckboxes={statusFilterCheckboxes}
              align={isMd ? 'center' : 'start'}
              width='w-35 md:w-40'
              triggerClassName='bg-background text-primary h-8.5 md:h-10 w-10 hover:bg-gray-50 border border-gray-200 shrink-0'
            />
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              count={
                (searchQuery && filteredCourses.length.toString()) ||
                courses.length.toString()
              }
              className='flex-1 min-w-50 lg:flex-initial'
            />
            <span className='inline-flex'>
              <CourseBackupActionsDropdown className='px-3 sm:px-4 py-2 md:py-2.5 shrink-0' />
            </span>
            <span className='sm:inline-flex lg:hidden'>{createButton(true)}</span>
            <span className='hidden lg:inline-flex'>{createButton(false)}</span>
          </div>

          {coursesLoading || isStatisticsModeLoading ? (
            <CoursesPageSceleton />
          ) : (
            <>
              {dashboardMode === 'analytics' &&
              filteredCourses.length > 0 &&
              displayedCourses.length === 0 ? (
                <StateComp
                  type='no-content'
                  message='Začněte vytvořením svého prvního kurzu'
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
                        statisticsMode={dashboardMode === 'analytics'}
                        onEdit={() => {
                          handleEditCourse(course)
                        }}
                        onDelete={() => deleteCourseMutation(course.uuid)}
                        onStatusChange={handleStatusChange}
                        planning={planningState}
                        onCopyAsDraft={async (source: CourseSummary) => {
                          handleCopyAsDraft(source)
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
