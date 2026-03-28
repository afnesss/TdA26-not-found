import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Label } from '@/components/ui/label'
import { getCourseSessionLeaderboard } from '@/api/queries/courseQueries'
import SummarySection from '../CoursePage/components/SummarySection'
import { useNavigate } from 'react-router-dom'
import { useUserCourseLayoutContext } from './UserCourseLayoutContext'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const UserCourseOverviewPage = () => {
  const navigate = useNavigate()
  const { courseId, courseData, activeModules } = useUserCourseLayoutContext()
  const { data: sessionLeaderboard } = useQuery({
    queryKey: ['course-session-leaderboard', courseId],
    queryFn: () => getCourseSessionLeaderboard(courseId),
    enabled: Boolean(courseId),
    refetchOnReconnect: true,
  })
  const leaderboard = sessionLeaderboard?.leaderboard ?? []
  const leaderboardTopThree = leaderboard.slice(0, 3)
  const leaderboardRest = leaderboard.slice(3)
  const [isLeaderboardExpanded, setIsLeaderboardExpanded] = useState(false)
  const visibleLeaderboard = isLeaderboardExpanded
    ? leaderboard
    : leaderboardTopThree

  return (
    <div className='space-y-5'>
      <SummarySection
        name={courseData.name}
        description={courseData.description ?? undefined}
        breadcrumbs={[
          { label: 'Kurzy', path: '/courses' },
          { label: courseData.name },
        ]}
      />

      <section className='rounded-xl border border-border bg-background p-4 shadow-sm space-y-3'>
        <div className='flex items-center justify-between gap-2'>
          <Label className='font-bold mb-0'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              Leaderboard
            </UnderlinedText>
          </Label>
          <p className='text-xs text-muted-foreground'>
            Kvízy v kurzu: {sessionLeaderboard?.totalQuizzes ?? 0}
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Leaderboard zatím nemá žádná data.
          </p>
        ) : (
          <div className='overflow-hidden rounded-lg border border-border/70 bg-muted/10'>
            <div className='divide-y divide-border/60'>
              {visibleLeaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className='flex flex-wrap items-center justify-between gap-2 bg-muted/20 px-3 py-2'
                >
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      #{entry.rank} {entry.username}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold'>
                      {entry.successRate == null ? '—' : `${entry.successRate}%`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {leaderboardRest.length > 0 && (
              <button
                type='button'
                className='w-full border-t border-border/60 px-3 py-2 text-sm font-medium text-left hover:bg-background/70 transition-colors'
                onClick={() => setIsLeaderboardExpanded((prev) => !prev)}
              >
                {isLeaderboardExpanded
                  ? 'Zobrazit méně'
                  : `Zobrazit další (${leaderboardRest.length})`}
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Label className='font-bold mb-3'>
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
              navigate(`/courses/${courseId}/modules/${moduleId}`)
            }
            userMode
          />
        )}
      </section>
    </div>
  )
}

export default UserCourseOverviewPage
