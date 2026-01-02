import { getCourses } from '@/api/queries'
import SearchBar from '@/components/shared/SearchBar'
import { type FilterIds } from '@/lib/constants'
import type { CourseSummary } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CourseComponent from '../../components/shared/CourseComponent'
import EmptyStateComp from '../../components/shared/StateComp'
import HintPageText from '../../components/shared/HintPageText'
import { Button } from '../../components/ui/button'
import { filterCourses } from '../CoursePage/utils/helperFunctions'
import Filters from './components/Filters'
import LoadingSceleton from './components/LoadingSceleton'
import StateComp from '../../components/shared/StateComp'

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterIds>('all')
  const [displayCount, setDisplayCount] = useState(9)
  const navigate = useNavigate()

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  if (isLoading) {
    return <LoadingSceleton />
  }

  const filteredCourses = filterCourses(courses, searchQuery)

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const dateKey =
      selectedFilter === 'newest'
        ? 'createdAt'
        : selectedFilter === 'updated'
          ? 'updatedAt'
          : null

    if (!dateKey) return 0

    return new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime()
  })

  const hasMoreCourses = sortedCourses.length > displayCount
  const displayedCourses = sortedCourses.slice(0, displayCount)
  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
    refetch()
  }

  return (
    <div className='h-full'>
      {/* Hero */}
      <div className='max-w-7xl mx-auto px-3 pt-3 '>
        <div className='flex flex-col lg:flex-row gap-3 md:gap-6 justify-center items-center pb-6'>
          <HintPageText
            text='Dostupné kurzy'
            icon={BookOpen}
            spanText={
              (searchQuery && displayedCourses.length.toString()) ||
              courses.length.toString()
            }
          />

          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <Filters
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />

        {/* Kurzy Grid */}
        <div className=' relative py-6'>
          <>
            {/* Grid kurzů */}
            {displayedCourses && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
                {displayedCourses.map((course, index) => {
                  return (
                    <CourseComponent
                      course={course}
                      index={index}
                      type='classic'
                    />
                  )
                })}
              </div>
            )}

            {/* Empty state */}
            {displayedCourses.length === 0 && !isLoading ? (
              <StateComp
                type='empty-search'
                onAction={() => {
                  setSearchQuery('')
                  setDisplayCount(9)
                }}
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
        </div>
      </div>
    </div>
  )
}

export default CoursesPage
