import { getCourseById } from '@/api/queries/courseQueries'
import StateComp from '@/components/shared/StateComp'
import { CourseDetailSchema, type CourseDetail } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import CourseSkeleton from '../../components/shared/loadingskeleton/CoursePageSkeleton'
import FeedSection from './components/FeedSection'
import MaterialsSection from './components/MaterialsSection'
import QuizesSection from './components/QuizesSection'
import SummarySection from './components/SummarySection'
import { useCourseFeedSSE } from '@/api/useCourseFeedSSE'

const CoursePage = () => {
  // const [courseData, setCourseData] = useState<CourseDetail  | null>(null);
  const { id } = useParams<{ id: string }>()

  // Establish SSE connection
  const { isConnected } = useCourseFeedSSE({ courseId: id! })

  const fetchCourse = async (id: string): Promise<CourseDetail> => {
    try {
      const raw = await getCourseById(id!)
      if (!raw) {
        throw Object.assign(new Error('Course not found'), { status: 404 })
      }
      const parsed = CourseDetailSchema.safeParse(raw)

      if (!parsed.success) {
        console.error('Course schema validation failed', parsed.error)
        throw new Error('Invalid course data')
      }

      return parsed.data
    } catch (err) {
      console.error(err)
      const error = err as { status?: number; message?: string }
      
      // If the error from API has status property, preserve it
      if (error.status) {
        throw Object.assign(new Error(error.message || 'Request failed'), { 
          status: error.status 
        })
      }
      
      throw err
    }
  }
  const {
    data: courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CourseDetail, Error & { status?: number }>({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id!),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return <CourseSkeleton />
  }

  if (isError || !courseData) {
    const isNotFound = error?.status === 404

    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <StateComp
          type={isNotFound ? 'not-found' : 'error'}
          onAction={() =>
            isNotFound ? (window.location.href = '/courses') : refetch()
          }
        />
      </div>
    )
  }

  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>
      <div className='max-w-7xl mx-auto md:px-6 lg:px-12 pb-8 space-y-8'>
        <SummarySection
          name={courseData.name}
          description={courseData.description ?? undefined}
        />

        <MaterialsSection materials={courseData.materials ?? []} />

        <QuizesSection courseData={courseData} />

        <FeedSection feed={courseData.feed ?? []} isConnected={isConnected} />
      </div>
    </div>
  )
}

export default CoursePage
