import { getCourses } from '@/api/queries'
import SearchBar from '@/components/shared/SearchBar'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CourseSummary } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CourseComponent from '../../components/shared/CourseComponent'
import { filterCourses } from '../CoursePage/utils/helperFunctions'

const DashboardDesign1 = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const filteredCourses = filterCourses(courses, searchQuery)

  const handleEditCourse = (course: CourseSummary) => {
    navigate(`/dashboard/${course.uuid}#details`)
  }

  return (
    <>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4  '>
        <div className='space-y-6 pt-2'>
          {/* Hero Section */}
          <div className='flex flex-col md:flex-row gap-3 md:gap-6 md:justify-between md:items-center'>
            <Label
              variant='title'
              size='primary'
              className='whitespace-nowrap md:shrink-0'
            >
              Správa kurzů
            </Label>

            {/* Mobile: Search + Button v řádku */}
            <div className='flex md:hidden flex-row gap-2 items-center'>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <Button
                variant='primary'
                size='primary'
                className='px-3 shrink-0'
              >
                <Plus className='w-5 h-5' />
              </Button>
            </div>

            {/* Desktop: Search uprostřed */}
            <div className='hidden md:flex md:flex-1 md:justify-center md:px-6'>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Desktop: Button vpravo */}
            <Button
              variant='primary'
              size='primary'
              className='hidden md:flex px-4'
            >
              <Plus className='w-5 h-5' />
              <span>Vytvořit kurz</span>
            </Button>
          </div>

          {/* Courses Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6'>
            {filteredCourses.map((course, index) => (
              <CourseComponent
                key={course.uuid ?? (course as CourseSummary).uuid ?? index}
                course={course}
                index={index}
                type='edit'
                onEdit={() => {
                  handleEditCourse(course!)
                }}
              />
            ))}
          </div>

          {!coursesLoading && !coursesError && courses.length === 0 ? (
            <StateComp
              type='no-content'
              onAction={() => console.log('Create course')}
              message='Začněte vytvořením svého prvního kurzu'
            />
          ) : coursesError ? (
            <StateComp
              type='error'
              onAction={() => refetchCourses()}
              message='Nepodařilo se načíst kurzy'
            />
          ) : (
            filteredCourses.length === 0 && (
              <StateComp
                type='empty-search'
                onAction={() => setSearchQuery('')}
              />
            )
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardDesign1
