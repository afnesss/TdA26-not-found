import FeedItemComp from '@/components/shared/FeedItemComp'
import CourseModulesGrid from '@/components/shared/CourseModulesGrid'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import feedImg from '@/assets/disconnect-blue.svg'
import { useFeedPagination } from '../CoursePage/utils/useFeedPagination'
import SummarySection from '../CoursePage/components/SummarySection'
import { useNavigate } from 'react-router-dom'
import { useUserCourseLayoutContext } from './UserCourseLayoutContext'
import { colorStyles } from '@/lib/constants'
import { cn } from '@/lib/utils'

const UserCourseOverviewPage = () => {
  const navigate = useNavigate()
  const { courseId, courseData, activeModules } = useUserCourseLayoutContext()
  const { allPosts, loadMorePosts, hasMore, isLoadingMore, paginationError } =
    useFeedPagination(courseId, courseData.feed ?? [])

  return (
    <div className='space-y-5'>
      <SummarySection
        name={courseData.name}
        description={courseData.description ?? undefined}
      />

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
            onOpenModule={(moduleId) =>
              navigate(`/courses/${courseId}/modules/${moduleId}`)
            }
            renderFooterActions={(m) => {
              return (
                <Button
                  variant={'grid'}
                  size={'sm'}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/courses/${courseId}/modules/${m.uuid}`)
                  }}
                  className={cn(
                    'bg-linear-to-br h-8',
                    colorStyles.bg['accent-teal-dark'],
                    colorStyles.text['accent-teal-dark'],
                  )}
                  disabled={courseData.status !== 'live'}
                >
                  <span className='font-semibold'>Zobrazit</span>
                </Button>
              )
            }}
          />
        )}
      </section>

      <section>
        <Label className='font-bold mb-2'>
          <UnderlinedText strokeWidth='4' height='10' offset='-bottom-0.5'>
            Oznámení
          </UnderlinedText>
        </Label>
        {allPosts && allPosts.length > 0 ? (
          <div className='bg-background rounded-xl shadow-md p-1.5 sm:p-3 md:p-5'>
            <div className='space-y-4'>
              {allPosts.map(
                (post) =>
                  post && (
                    <FeedItemComp
                      feedItem={post}
                      key={post.uuid}
                      type='classic'
                    />
                  ),
              )}
            </div>

            {hasMore && (
              <div className='mt-3 text-center'>
                <Button
                  variant='primary'
                  size='primary'
                  onClick={() => {
                    void loadMorePosts()
                  }}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore
                    ? 'Načítání...'
                    : paginationError
                      ? 'Chyba při načítání'
                      : 'Načíst další příspěvky'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <StateComp
            img={feedImg}
            iconClassName='w-12 h-12 md:w-13 h-13'
            type='no-content'
            message='Zatím žádné příspěvky'
            className='pt-8 pb-0'
          />
        )}
      </section>
    </div>
  )
}

export default UserCourseOverviewPage
