import { getCourseById, getCourses } from '@/api/queries/courseQueries'
import StateComp from '@/components/shared/StateComp'
import {
  CourseDetailSchema,
  type CourseDetail,
  type CourseSummary,
} from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import CourseSkeleton from '../../components/shared/loadingskeleton/CoursePageSkeleton'
import FeedSection from './components/FeedSection'
import MaterialsSection from './components/MaterialsSection'
import QuizesSection from './components/QuizesSection'
import SummarySection from './components/SummarySection'
import { useCourseFeedSSE } from '@/api/useCourseFeedSSE'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import NotFoundPage from '../NotFoundPage'
import { useCoursePageQueries } from './utils/useCoursePageQueries'

const CoursePage = () => {
  const { id } = useParams<{ id: string }>()
  // useTitle ()
  // Establish SSE connection
  const navigate = useNavigate()
  const redirectedRef = useRef(false)
  const { isConnected } = useCourseFeedSSE({ courseId: id! })

  const {
    coursesUser,
    isCoursesUserLoading,
    courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoursePageQueries(id)
  const isOffline = !navigator.onLine

  useTitle(courseData?.name || 'Kurz')
  const hasAccessToCourse = coursesUser.some((c) => c.uuid === id)
  const canEvaluateCourseAccess = !isCoursesUserLoading
  const shouldShowNotFoundByAccess =
    canEvaluateCourseAccess && !hasAccessToCourse && !courseData

  useEffect(() => {
    if (!courseData || redirectedRef.current) return

    const isPaused = courseData.status === 'paused'
    const isArchived = courseData.status === 'archived'
    const isClosed = isPaused || isArchived
    if (!isClosed) return

    redirectedRef.current = true

    navigate('/courses', { replace: true })
  }, [courseData, navigate])

  if (isLoading || !canEvaluateCourseAccess) {
    return <CourseSkeleton />
  }
  if (shouldShowNotFoundByAccess) {
    return <NotFoundPage />
  }

  if (isError || !courseData) {
    const isNotFound = error?.status === 404

    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <StateComp
          type={
            isNotFound ? 'not-found' : isOffline ? 'network-offline' : 'error'
          }
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
