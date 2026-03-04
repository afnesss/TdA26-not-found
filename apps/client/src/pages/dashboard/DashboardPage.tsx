import {
  getCourseDashboardAnalytics,
  getCourses,
} from '@/api/queries/courseQueries'
import { useDashboardCoursesSSE } from '@/api/useDashboardCoursesSSE'
import FilterDropdown from '@/components/shared/FilterDropdown'
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
import type {
  CourseDashboardAnalytics,
  CourseStatus,
  CourseSummary,
} from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useCoursePlanning } from '@/pages/CoursePage/utils/useCoursePlanning'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpenText, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
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
  const statisticsAllowedStatuses: CourseStatus[] = [
    'live',
    'paused',
    'archived',
  ]
  const isStatisticsAllowedStatus = (status: CourseStatus) =>
    statisticsAllowedStatuses.includes(status)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedFilter, setSelectedFilter] = useLocalStorage<FilterIds>(
    `${DASHBOARD_PAGE_FILTERS_KEY}-sort`,
    'newest',
  )
  const [statusFilters, setStatusFilters] = useLocalStorage<
    Record<CourseStatus, boolean>
  >(`${DASHBOARD_PAGE_FILTERS_KEY}-status`, defaultStatusFilters)

  const [dashboardMode, setDashboardMode] = useState<
    'content' | 'statistics' | 'global'
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
  const allStatisticsCourses = courses.filter((course) =>
    isStatisticsAllowedStatus(course.status),
  )
  const statisticsCourses = sortedCourses.filter((course) =>
    isStatisticsAllowedStatus(course.status),
  )
  const coursesForCurrentMode =
    dashboardMode === 'statistics' ? statisticsCourses : sortedCourses

  const hasMoreCourses = coursesForCurrentMode.length > displayCount
  const displayedCourses = coursesForCurrentMode.slice(0, displayCount)
  const globalCourses = allStatisticsCourses
  const courseStatisticsQueries = useQueries({
    queries: globalCourses.map((course) => ({
      queryKey: ['course-dashboard-statistics', course.uuid],
      queryFn: () => getCourseDashboardAnalytics(course.uuid),
      enabled: dashboardMode === 'global',
    })),
  })

  const loadedStatistics = courseStatisticsQueries
    .map((query) => query.data)
    .filter(
      (statistics): statistics is CourseDashboardAnalytics =>
        statistics !== undefined,
    )

  const planning = useCoursePlanning({ queryClient })

  const dashboardTabs: Array<{
    value: 'content' | 'statistics' | 'global'
    label: string
    disabled?: boolean
  }> = [
    { value: 'content', label: 'Obsah' },
    {
      value: 'statistics',
      label: 'Statistiky',
      disabled: statisticsCourses.length === 0,
    },
  ]

  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const resetStatusFilters = () => {
    setStatusFilters(defaultStatusFilters)
  }

  const handleEditCourse = (course: CourseSummary) => {
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
      disabled={dashboardMode === 'statistics'}
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
          ) : (
            <>
              {dashboardMode === 'statistics' &&
              filteredCourses.length > 0 &&
              displayedCourses.length === 0 ? (
                <StateComp
                  type='no-content'
                  message='Žádné kurzy ve stavu live, paused nebo archived'
                />
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 '>
                  {courseDraft && dashboardMode !== 'statistics' && (
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
                        statisticsMode={
                          dashboardMode === 'statistics' &&
                          isStatisticsAllowedStatus(course.status)
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
