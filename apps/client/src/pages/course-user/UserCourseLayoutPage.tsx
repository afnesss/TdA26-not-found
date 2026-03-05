import { useCourseFeedSSE } from '@/api/useCourseFeedSSE'
import StateComp from '@/components/shared/StateComp'
import CourseSkeleton from '@/components/shared/loadingskeleton/CoursePageSkeleton'
import { useTitle } from '@/lib/dynamicTitleHook'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import NotFoundPage from '../NotFoundPage'
import { useCoursePageQueries } from '../CoursePage/utils/useCoursePageQueries'
import UserCourseFeedSection from './components/UserCourseFeedSection'

const UserCourseLayoutPage = () => {
  const { courseId, moduleId } = useParams<{
    courseId: string
    moduleId?: string
  }>()
  const navigate = useNavigate()
  const redirectedRef = useRef(false)
  const moduleRedirectRef = useRef<string | null>(null)
  const queryClient = useQueryClient()
  const { isConnected } = useCourseFeedSSE({
    courseId: courseId!,
    syncModuleActivation: true,
  })

  const {
    coursesUser,
    isCoursesUserLoading,
    isCoursesUserFetching,
    courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoursePageQueries(courseId)

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  useTitle(courseData?.name || 'Kurz')

  const hasAccessToCourse = coursesUser.some((c) => c.uuid === courseId)
  const canEvaluateCourseAccess =
    !isCoursesUserLoading && !isCoursesUserFetching
  const shouldShowNotFoundByAccess =
    canEvaluateCourseAccess && !hasAccessToCourse && !courseData

  useEffect(() => {
    if (!courseData || redirectedRef.current) return

    const isClosed = courseData.status !== 'live'

    if (!isClosed) return

    redirectedRef.current = true
    if (courseId) {
      queryClient.removeQueries({ queryKey: ['course', courseId] })
    }
    navigate('/courses', { replace: true })
  }, [courseData, courseId, navigate, queryClient])

  useEffect(() => {
    if (!courseData || !courseId || !moduleId) return

    const currentModule = courseData.modules?.find(
      (module) => module.uuid === moduleId,
    )

    if (!currentModule || currentModule.status === 'active') return

    if (moduleRedirectRef.current === moduleId) return

    moduleRedirectRef.current = moduleId
    // toast.info('Modul byl skryt lektorem')
    navigate(`/courses/${courseId}`, { replace: true })
  }, [courseData, courseId, moduleId, navigate])

  if (!courseId) {
    return <NotFoundPage />
  }

  if (isLoading || !canEvaluateCourseAccess) {
    return <CourseSkeleton />
  }

  if (courseData && courseData.status !== 'live') {
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
          onAction={() => {
            if (isNotFound) {
              navigate('/courses', { replace: true })
              return
            }
            void refetch()
          }}
        />
      </div>
    )
  }

  const activeModules = (courseData.modules ?? []).filter(
    (module) => module.status === 'active',
  )

  return (
    <div className='h-full overflow-y-auto hide-scrollbar'>
      <div className='max-w-6xl mx-auto space-y-5'>
        <Outlet
          context={{
            courseId,
            courseData,
            activeModules,
            isConnected,
          }}
        />
        <UserCourseFeedSection
          courseId={courseId}
          initialFeed={courseData.feed ?? []}
        />
      </div>
    </div>
  )
}

export default UserCourseLayoutPage
