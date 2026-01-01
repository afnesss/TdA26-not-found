import { useEffect, useState } from 'react'
import { Search, Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '../../components/ui/button'
import HintPageText from '../../components/shared/HintPageText'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { colorStyles, colors, type FilterIds } from '@/lib/constants'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CardDate from './components/CardDate'
import { Label } from '@/components/ui/label'
import { getCourses } from '@/api/queries'
import { useNavigate } from 'react-router'
import type { CourseSummary } from '@/lib/schemas'
import LoadingSceleton from './components/LoadingSceleton'
import Filters from './components/Filters'
import EmptyStateComp from '../../components/shared/EmptyStateComp'
import SearchBar from '@/components/shared/SearchBar'
import { useQuery } from '@tanstack/react-query'
import CourseComponent from '../../components/shared/CourseComponent'

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

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            {displayedCourses.length === 0 && !isLoading && (
              <EmptyStateComp
                onClick={() => {
                  setSearchQuery('')
                  setDisplayCount(9)
                }}
              />
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
