import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import CourseLeaderboard from '@/components/shared/CourseLeaderboard'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { getCourseSessionLeaderboard } from '@/api/queries/courseQueries'
import { Label } from '@/components/ui/label'
import { buildOrgCoursesPath, buildOrgModulePath } from '@/lib/routes'
import SummarySection from '../CoursePage/components/SummarySection'
import { useNavigate } from 'react-router-dom'
import { useUserCourseLayoutContext } from './UserCourseLayoutContext'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

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
            <div className='rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap'>
              Kvízy v kurzu: {courseSessionOverview?.totalQuizzes ?? 0}
            </div>
          </div>
          <CourseLeaderboard leaderboard={leaderboard} />
        </>
      )}

      <section>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Label className='font-bold mb-2'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              Aktivní moduly
            </UnderlinedText>
          </Label>
        </div>

        {activeModules.length === 0 ? (
          <StateComp
            type='no-content'
            message='Kurz zatím nemá žádné aktivní moduly'
            className='pt-8 pb-0'
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
