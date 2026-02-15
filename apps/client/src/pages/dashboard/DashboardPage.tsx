import {
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from '@/api/queries/courseQueries'
import SearchBar from '@/components/shared/SearchBar'
import StateComp from '@/components/shared/StateComp'
import HintPageText from '@/components/shared/HintPageText'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CourseSummary } from '@/lib/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpenText } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import CourseComponent from '../../components/shared/CourseComponent'
import { filterCourses } from '../CoursePage/utils/helperFunctions'
import CoursesPageSceleton from '../../components/shared/loadingskeleton/CoursesSceleton'
import { toast } from 'sonner'
import { useTitle } from '@/lib/dynamicTitleHook'
import type { ApiError } from '@/lib/types'
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
} from '../CoursePage/utils/useCourseMutation'
import type { CourseStatus } from '@/lib/schemas'

const DashboardDesign1 = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [courseDraft, setCourseDraft] = useState<CourseSummary | null>(null)
  const [displayCount, setDisplayCount] = useState(9)
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery<CourseSummary[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  })

  const { mutateAsync: deleteCourseMutation } = useDeleteCourseMutation()
  const { mutateAsync: createCourseMutation } =
    useCreateCourseMutation(setCourseDraft)

  const handleStatusChange = async (
    courseId: string,
    newStatus: CourseStatus,
  ) => {
    const statusMessages: Record<CourseStatus, string> = {
      draft: 'Kurz byl převeden do návrhu',
      planned: 'Kurz byl naplánován',
      live: 'Kurz byl spuštěn',
      paused: 'Kurz byl pozastaven',
      archived: 'Kurz byl ukončen',
    }

    try {
      await updateCourse(courseId, { status: newStatus })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses-user'] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast.success(statusMessages[newStatus])
    } catch (error) {
      toast.error('Nepodařilo se změnit stav kurzu')
    }
  }
  const filteredCourses = filterCourses(courses, searchQuery)
  const hasMoreCourses = filteredCourses.length > displayCount
  const displayedCourses = filteredCourses.slice(0, displayCount)

  const loadMoreCourses = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const handleEditCourse = (course: CourseSummary) => {
    navigate(`/dashboard/${course.uuid}#details`)
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

  useTitle('Sprava kurzů')
  return (
    <>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto md:px-4  '>
        <div className='space-y-6 pt-3'>
          {/* Hero Section */}
          <div className='flex flex-row justify-center items-center '>
            <HintPageText
              text='Správa kurzů'
              icon={BookOpenText}
              spanText={
                (searchQuery && filteredCourses.length.toString()) ||
                courses.length.toString()
              }
              className='hidden lg:inline-flex mr-3'
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
          {/* Courses Grid */}
          {coursesLoading ? (
            <CoursesPageSceleton />
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-6 lg:mt-7'>
                {courseDraft && (
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
                      handleEditCourse(courseDraft!)
                    }}
                    onCancelDraft={() => setCourseDraft(null)}
                  />
                )}
                {displayedCourses.map((course, index) => (
                  <CourseComponent
                    key={course.uuid ?? (course as CourseSummary).uuid ?? index}
                    course={course}
                    index={courseDraft ? index + 1 : index}
                    type='edit'
                    onEdit={() => {
                      handleEditCourse(course!)
                    }}
                    onDelete={() => deleteCourseMutation(course.uuid)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>

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
          {/* display */}
          {!courseDraft &&
            (!coursesLoading && !coursesError && courses.length === 0 ? (
              <StateComp
                type='no-content'
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
            ))}
        </div>
      </div>
    </>
  )
}

export default DashboardDesign1
