import { resolveCourseShareToken } from '@/api/queries/courseQueries'
import StateComp from '@/components/shared/StateComp'
import { buildOrgCoursePath, buildOrgCoursesPath } from '@/lib/routes'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const CourseShareRedirectPage = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['course-share-resolve', token],
    queryFn: () => resolveCourseShareToken(token!),
    enabled: Boolean(token),
    retry: false,
  })

  useEffect(() => {
    if (data?.courseId) {
      navigate(buildOrgCoursePath(data.orgSlug, data.courseId), { replace: true })
    }
  }, [data, navigate])

  if (!token) {
    return <StateComp type='not-found' onAction={() => navigate('/')} />
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[70vh] items-center justify-center'>
        <StateComp type='no-content' message='Otevírám kurz…' className='py-0' />
      </div>
    )
  }

  if (isError) {
    const status = (error as { status?: number }).status
    const isExpired = status === 410

    return (
      <div className='flex min-h-[70vh] items-center justify-center'>
        <StateComp
          type={isExpired ? 'not-found' : 'error'}
          message={
            isExpired
              ? 'Tento QR kód už není platný'
              : 'Nepodařilo se otevřít sdílený kurz'
          }
          actionText={isExpired ? 'Zpět na kurzy' : 'Zkusit znovu'}
          onAction={() => {
            if (isExpired) {
              navigate('/', { replace: true })
              return
            }

            void refetch()
          }}
        />
      </div>
    )
  }

  return null
}

export default CourseShareRedirectPage
