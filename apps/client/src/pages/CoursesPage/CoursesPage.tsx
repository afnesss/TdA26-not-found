import { getCourses } from '@/api/queries/courseQueries'
import { useCoursesSSE } from '@/api/useCourseSSE'
import FilterDropdown from '@/components/shared/FilterDropdown'
import SearchBar from '@/components/shared/SearchBar'
import HintPageText from '@/components/shared/HintPageText'
import CourseComponent from '@/components/shared/CourseComponent'
import CoursesPageSceleton from '@/components/shared/loadingskeleton/CoursesSceleton'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { CourseSummary } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { BookOpenText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useMediaQuery } from 'usehooks-ts'
import type { FilterIds } from '@/lib/constants'
import {
  filterCourses,
  sortCoursesByFilter,
  useAutoTopScroll,
} from '../CoursePage/utils/helperFunctions'

const COURSES_PAGE_FILTERS_KEY = 'courses-page-filters'

const CoursesPage = () => {
  useAutoTopScroll()
  const { t, i18n } = useTranslation('courses')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useLocalStorage<FilterIds>(
    `${COURSES_PAGE_FILTERS_KEY}-sort`,
    'newest',
  )
  const [statusFilters, setStatusFilters] = useLocalStorage<
    Record<'live' | 'planned' | 'paused', boolean>
  >(`${COURSES_PAGE_FILTERS_KEY}-status`, {
    live: true,
    planned: true,
    paused: true,
  })
  const [displayCount, setDisplayCount] = useState(9)
  const isMd = useMediaQuery('(min-width: 768px)')
  const { orgSlug } = useParams<{ orgSlug?: string }>()

  useTitle(orgSlug ? t('organizationPageTitle') : t('pageTitle'))

  const { isConnected } = useCoursesSSE(orgSlug)
  const uiLocale = i18n.resolvedLanguage === 'cs' ? 'cs' : 'en'

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses-user', uiLocale],
    queryFn: () => getCourses(true, orgSlug),
  })

  const filterItems = [
    { label: t('sorting.newest'), value: 'newest' as const },
    { label: t('sorting.oldest'), value: 'oldest' as const },
  ]

  const statusFilterItems = [
    { label: t('statuses.live'), value: 'live' as const },
    { label: t('statuses.planned'), value: 'planned' as const },
    { label: t('statuses.paused'), value: 'paused' as const },
  ]

  const filteredCourses = filterCourses(courses, searchQuery).filter(
    (course) =>
      course.status === 'live' ||
      course.status === 'planned' ||
      course.status === 'paused'
        ? statusFilters[course.status]
        : true,
  )

  const sortedCourses = sortCoursesByFilter(filteredCourses, selectedFilter)
  const hasMoreCourses = sortedCourses.length > displayCount
  const displayedCourses = sortedCourses.slice(0, displayCount)

  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
    refetch()
  }

  const resetStatusFilters = () => {
    setStatusFilters({ live: true, planned: true, paused: true })
  }

  const isSearchEmpty = searchQuery.trim() === ''
  const isDefaultFilters =
    selectedFilter === 'newest' &&
    statusFilters.live &&
    statusFilters.planned &&
    statusFilters.paused
  const useResetStatusAction = isSearchEmpty && !isDefaultFilters

  return (
    <div className='h-full'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-row md:justify-center justify-between items-center gap-2 sm:gap-3 mb-4 md:mb-5 w-full md:w-auto'>
          <div className='hidden lg:flex'>
            <HintPageText
              text={t('heading')}
              icon={BookOpenText}
              spanText={
                (searchQuery && displayedCourses.length.toString()) ||
                courses.length.toString()
              }
            />
          </div>

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
            triggerAriaLabel={t('filterAriaLabel')}
          />

          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder={t('searchPlaceholder')}
            count={
              (searchQuery && displayedCourses.length.toString()) ||
              courses.length.toString()
            }
            className='flex-1 lg:flex-initial'
          />
        </div>

        <div className='relative'>
          {isLoading ? (
            <CoursesPageSceleton />
          ) : (
            <>
              {displayedCourses && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
                  {displayedCourses.map((course, index) => (
                    <CourseComponent
                      key={course.uuid}
                      course={course}
                      index={index}
                      type='classic'
                    />
                  ))}
                </div>
              )}

              {displayedCourses.length === 0 && !isLoading && !isError ? (
                courses.length === 0 && isSearchEmpty && isDefaultFilters ? (
                  <StateComp message={t('empty.noCourses')} type='no-content' />
                ) : (
                  <StateComp
                    type='empty-search'
                    onAction={() => {
                      if (useResetStatusAction) {
                        resetStatusFilters()
                        return
                      }
                      setSearchQuery('')
                      setDisplayCount(9)
                    }}
                    actionText={
                      useResetStatusAction
                        ? t('actions.resetFilters')
                        : undefined
                    }
                  />
                )
              ) : isError ? (
                <StateComp
                  type='error'
                  onAction={() => {
                    refetch()
                  }}
                />
              ) : null}

              {hasMoreCourses && (
                <div className='mt-4 text-center'>
                  <Button
                    variant='primary'
                    size='primary'
                    onClick={() => {
                      loadMoreCourses()
                    }}
                  >
                    {t('actions.loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursesPage
