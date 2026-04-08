import { useCourseFeedSSE } from '@/api/useCourseFeedSSE'
import { useOrganizationAuth } from '@/auth/useOrganizationAuth'
import StateComp from '@/components/shared/StateComp'
import CourseSkeleton from '@/components/shared/loadingskeleton/CoursePageSkeleton'
import { useTitle } from '@/lib/dynamicTitleHook'
import { buildOrgCoursePath, buildOrgCoursesPath } from '@/lib/routes'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import NotFoundPage from '../NotFoundPage'
import { useCoursePageQueries } from '../CoursePage/utils/useCoursePageQueries'
import UserCourseFeedSection from './components/UserCourseFeedSection'
import { useAutoTopScroll } from '../CoursePage/utils/helperFunctions'

const UserCourseLayoutPage = () => {
  const { t } = useTranslation('courses')
  const { orgSlug, courseId, moduleId } = useParams<{
    orgSlug?: string
    courseId: string
    moduleId?: string
  }>()
  const location = useLocation()
  const navigate = useNavigate()
  const redirectedRef = useRef(false)
  const moduleRedirectRef = useRef<string | null>(null)
  const authRedirectedRef = useRef(false)
  const queryClient = useQueryClient()
  const { user, isLoading: isAuthLoading } = useOrganizationAuth(orgSlug)
  const { isConnected } = useCourseFeedSSE({
    courseId: courseId!,
    orgSlug,
    syncModuleActivation: true,
    onCourseRemoved: () => {
      if (redirectedRef.current) return
      redirectedRef.current = true
      if (courseId) {
        queryClient.removeQueries({ queryKey: ['course', courseId] })
      }
      navigate(buildOrgCoursesPath(orgSlug), { replace: true })
    },
  })

  useAutoTopScroll()

  const {
    coursesUser,
    isCoursesUserLoading,
    isCoursesUserFetching,
    courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoursePageQueries(courseId, orgSlug)

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const isStudentUser = user?.role === 'student'
  const redirectTarget = `${location.pathname}${location.search}${location.hash}`

  useTitle(courseData?.name || t('userCourse.titleFallback'))

  const hasAccessToCourse = coursesUser.some((c) => c.uuid === courseId)
  const canEvaluateCourseAccess =
    !isCoursesUserLoading && !isCoursesUserFetching
  const shouldShowNotFoundByAccess =
    canEvaluateCourseAccess && !hasAccessToCourse && !courseData

  useEffect(() => {
    if (!courseId || isAuthLoading || !orgSlug) return

    if (isStudentUser) {
      authRedirectedRef.current = false
      return
    }

    if (authRedirectedRef.current) return
    authRedirectedRef.current = true

    navigate(
      `/${orgSlug}/login?mode=student&redirect=${encodeURIComponent(redirectTarget)}`,
      { replace: true },
    )
  }, [courseId, isAuthLoading, isStudentUser, navigate, orgSlug, redirectTarget])

  useEffect(() => {
    if (!courseData || redirectedRef.current) return

    const isClosed = courseData.status !== 'live'

    if (!isClosed) return

    redirectedRef.current = true
    if (courseId) {
      queryClient.removeQueries({ queryKey: ['course', courseId] })
    }
    navigate(buildOrgCoursesPath(orgSlug), { replace: true })
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
    navigate(buildOrgCoursePath(orgSlug, courseId), { replace: true })
  }, [courseData, courseId, moduleId, navigate])

  if (!courseId) {
    return <NotFoundPage />
  }

  if (isLoading || !canEvaluateCourseAccess || isAuthLoading) {
    return <CourseSkeleton showLeaderboard={!moduleId} />
  }

  if (courseData && courseData.status !== 'live') {
    return <CourseSkeleton showLeaderboard={!moduleId} />
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
              navigate(buildOrgCoursesPath(orgSlug), { replace: true })
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
        {!isStudentUser ? (
          <CourseSkeleton showLeaderboard={!moduleId} />
        ) : (
          <>
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
              orgSlug={orgSlug}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default UserCourseLayoutPage
