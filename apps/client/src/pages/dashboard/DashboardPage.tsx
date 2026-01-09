import { createCourse, getCourses } from '@/api/queries/courseQueries'
import SearchBar from '@/components/shared/SearchBar'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CourseSummary } from '@/lib/schemas'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CourseComponent from '../../components/shared/CourseComponent'
import { filterCourses } from '../CoursePage/utils/helperFunctions'
import CoursesPageSceleton from '../../components/shared/loadingskeleton/CoursesSceleton'

type CourseRequest = {
  name: string
  description: string
}

const DashboardDesign1 = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [courseDraft, setCourseDraft] = useState<CourseSummary | null>(null)
  const queryClient = useQueryClient()

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

  const handleAddMaterial = () => {
    const newDraft: CourseSummary = {
      uuid: 'testid',
      name: '',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCourseDraft(newDraft)
  }

  return (
    <>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto md:px-4  '>
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
              onClick={handleAddMaterial}
            >
              <Plus className='w-5 h-5' />
              <span>Vytvořit kurz</span>
            </Button>
          </div>

          {/* Courses Grid */}
          {coursesLoading ? (
            <CoursesPageSceleton />
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6'>
              {courseDraft && (
                <CourseComponent
                  key={courseDraft.uuid}
                  course={courseDraft}
                  index={0}
                  type='edit'
                  isDraft
                  onSaveDraft={async (data) => {
                    await createCourse(data)
                    setCourseDraft(null)
                    queryClient.invalidateQueries({
                      queryKey: ['courses'],
                    })
                  }}
                  onEdit={() => {
                    handleEditCourse(courseDraft!)
                  }}
                  onCancelDraft={() => setCourseDraft(null)}
                />
              )}
              {filteredCourses.map((course, index) => (
                <CourseComponent
                  key={course.uuid ?? (course as CourseSummary).uuid ?? index}
                  course={course}
                  index={courseDraft ? index + 1 : index}
                  type='edit'
                  onEdit={() => {
                    handleEditCourse(course!)
                  }}
                />
              ))}
            </div>
          )}

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
            filteredCourses.length === 0 &&
            !coursesLoading && (
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
