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

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterIds>('newest')
  const [statusFilters, setStatusFilters] = useState<
    Record<'live' | 'planned', boolean>
  >({
    live: true,
    planned: true,
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
      course.status === 'live' || course.status === 'planned'
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
    setStatusFilters({ live: true, planned: true })
  }

  const statusFilterItems: { label: string; value: 'live' | 'planned' }[] = [
    { label: 'Aktivní', value: 'live' },
    { label: 'Naplanováné', value: 'planned' },
  ]

  useTitle('Kurzy')

  const isSearchEmpty = searchQuery.trim() === ''
  const useResetStatusAction = isSearchEmpty && courses.length > 0

  return (
    <div className='h-full'>
      {/* Hero */}
      <div className='max-w-7xl mx-auto lg:px-4 pt-3'>
        <div className='flex flex-row md:justify-center justify-between items-center mb-3 w-full md:w-auto'>
          <HintPageText
            text='Dostupné kurzy'
            icon={BookOpenText}
            spanText={
              (searchQuery && displayedCourses.length.toString()) ||
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
              (searchQuery && displayedCourses.length.toString()) ||
              courses.length.toString()
            }
            className='flex-1 lg:flex-initial'
          />
        </div>

        {/* Kurzy Grid */}
        <div className=' relative py-3 md:py-4'>
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
                  actionText={useResetStatusAction ? 'Zrušit filtry' : undefined}
                />
              ) : isError ? (
                <StateComp
                  type='error'
                  onAction={() => {
                    refetch()
                  }}
                />
              ) : (
                !isLoading &&
                !isError &&
                courses.length === 0 && (
                  <StateComp
                    message='Žádné kurzy k zobrazení'
                    type='no-content'
                  />
                )
              )}

              {/* Load More button */}
              {hasMoreCourses && (
                <div className='mt-8 text-center'>
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
