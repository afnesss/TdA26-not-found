import { getCourses } from '@/api/queries/courseQueries'
import SearchBar from '@/components/shared/SearchBar'
import FilterDropdown from '@/components/shared/FilterDropdown'
import { filterItems, type FilterIds } from '@/lib/constants'
import type { CourseSummary } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { BookOpenText } from 'lucide-react'
import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import CourseComponent from '../../components/shared/CourseComponent'
import HintPageText from '../../components/shared/HintPageText'
import CoursesPageSceleton from '../../components/shared/loadingskeleton/CoursesSceleton'
import StateComp from '../../components/shared/StateComp'
import { Button } from '../../components/ui/button'
import {
  filterCourses,
  sortCoursesByFilter,
} from '../CoursePage/utils/helperFunctions'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useCoursesSSE } from '@/api/useCourseSSE'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const COURSES_PAGE_FILTERS_KEY = 'courses-page-filters'

const CoursesPage = () => {
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
  const { isConnected } = useCoursesSSE()

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses-user'],
    queryFn: () => getCourses(true),
  })

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

  const statusFilterItems: {
    label: string
    value: 'live' | 'planned' | 'paused'
  }[] = [
    { label: 'Aktivní', value: 'live' },
    { label: 'Naplanováné', value: 'planned' },
    { label: 'Pozastavené', value: 'paused' },
  ]

  useTitle('Kurzy')

  const isSearchEmpty = searchQuery.trim() === ''
  const isDefaultFilters =
    selectedFilter === 'newest' &&
    statusFilters.live &&
    statusFilters.planned &&
    statusFilters.paused
  const useResetStatusAction = isSearchEmpty && !isDefaultFilters

  return (
    <div className='h-full'>
      {/* Hero */}
      <div className='max-w-7xl mx-auto  '>
        <div className='flex flex-row md:justify-center justify-between items-center gap-2 sm:gap-3 mb-4 md:mb-5 w-full md:w-auto'>
          <div className='hidden lg:flex'>
            <HintPageText
              text='Dostupné kurzy'
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
          />

          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            count={
              (searchQuery && displayedCourses.length.toString()) ||
              courses.length.toString()
            }
            className='flex-1 lg:flex-initial'
          />
        </div>

        {/* Kurzy Grid */}
        <div className=' relative '>
          {isLoading ? (
            <CoursesPageSceleton />
          ) : (
            <>
              {/* Grid kurzů */}
              {displayedCourses && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
                  {displayedCourses.map((course, index) => {
                    return (
                      <CourseComponent
                        key={course.uuid}
                        course={course}
                        index={index}
                        type='classic'
                      />
                    )
                  })}
                </div>
              )}

              {/* Empty state */}
              {displayedCourses.length === 0 && !isLoading && !isError ? (
                courses.length === 0 && isSearchEmpty && isDefaultFilters ? (
                  <StateComp
                    message='Žádné kurzy k zobrazení'
                    type='no-content'
                  />
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
                      useResetStatusAction ? 'Zrušit filtry' : undefined
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

              {/* Load More button */}
              {hasMoreCourses && (
                <div className='mt-4 text-center'>
                  <Button
                    variant='primary'
                    size='primary'
                    onClick={() => {
                      loadMoreCourses()
                    }}
                  >
                    Načíst další kurzy
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
