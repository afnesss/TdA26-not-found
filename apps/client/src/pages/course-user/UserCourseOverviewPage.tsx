import { getCourseSessionLeaderboard } from '@/api/queries/courseQueries'
import CourseLeaderboard from '@/components/shared/CourseLeaderboard'
import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import CourseQuizCountBadge from '@/components/shared/CourseQuizCountBadge'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import { buildOrgCoursesPath, buildOrgModulePath } from '@/lib/routes'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import SummarySection from '../CoursePage/components/SummarySection'
import { useUserCourseLayoutContext } from './UserCourseLayoutContext'

const UserCourseOverviewPage = () => {
  const navigate = useNavigate()
  const { orgSlug } = useParams<{ orgSlug?: string }>()
  const { courseId, courseData, activeModules } = useUserCourseLayoutContext()
  const showLeaderboard =
    courseData.status === 'live' ||
    courseData.status === 'paused' ||
    courseData.status === 'archived'

  const { data: courseSessionOverview } = useQuery({
    queryKey: ['course-session-leaderboard', courseId],
    queryFn: () => getCourseSessionLeaderboard(courseId, orgSlug),
    enabled: Boolean(courseId) && showLeaderboard,
    refetchOnReconnect: true,
  })

  const leaderboard = courseSessionOverview?.leaderboard ?? []

  return (
    <div className='space-y-5'>
      <SummarySection
        name={courseData.name}
        description={courseData.description ?? undefined}
        breadcrumbs={[
          { label: 'Kurzy', path: buildOrgCoursesPath(orgSlug) },
          { label: courseData.name },
        ]}
      />

      {showLeaderboard && (
        <>
          <div className='flex items-center justify-between gap-3'>
            <Label className='font-bold'>
              <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
                Leaderboard studentů
              </UnderlinedText>
            </Label>
            <CourseQuizCountBadge
              totalQuizzes={courseSessionOverview?.totalQuizzes ?? 0}
            />
          </div>
          <CourseLeaderboard leaderboard={leaderboard} showLeaderTrophy />
        </>
      )}

      <section>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Label className='mb-2 font-bold'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              Aktivní moduly
            </UnderlinedText>
          </Label>
        </div>

        {activeModules.length === 0 ? (
          <StateComp
            type='no-content'
            message='Kurz zatím nemá žádné aktivní moduly'
            className='pb-0 pt-8'
          />
        ) : (
          <CourseModulesGrid
            modules={activeModules}
            courseStatus={courseData.status}
            onOpenModule={(moduleId) =>
              navigate(buildOrgModulePath(orgSlug, courseId, moduleId))
            }
            userMode
          />
        )}
      </section>
    </div>
  )
}

export default UserCourseOverviewPage
