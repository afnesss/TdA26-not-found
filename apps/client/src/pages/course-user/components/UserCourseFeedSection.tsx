import feedImg from '@/assets/disconnect-blue.svg'
import FeedItemComp from '@/components/shared/FeedItemComp'
import StateComp from '@/components/shared/StateComp'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { FeedItem } from '@/lib/schemas'
import { useFeedPagination } from '@/pages/CoursePage/utils/useFeedPagination'
import { useTranslation } from 'react-i18next'

type UserCourseFeedSectionProps = {
  courseId: string
  initialFeed: FeedItem[]
  orgSlug?: string
}

const UserCourseFeedSection = ({
  courseId,
  initialFeed,
  orgSlug,
}: UserCourseFeedSectionProps) => {
  const { t } = useTranslation('courses')
  const { allPosts, loadMorePosts, hasMore, isLoadingMore, paginationError } =
    useFeedPagination(courseId, initialFeed, orgSlug)

  return (
    <section>
      <Label className='font-bold mb-2'>
        <UnderlinedText strokeWidth='4' height='10' offset='-bottom-0.5'>
          {t('userCourse.feedSection.title')}
        </UnderlinedText>
      </Label>
      {allPosts && allPosts.length > 0 ? (
        <div className='bg-background rounded-xl shadow-md p-1.5 sm:p-3 md:p-5'>
          <div className='space-y-4'>
            {allPosts.map(
              (post) =>
                post && (
                  <FeedItemComp feedItem={post} key={post.uuid} type='classic' />
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
                  ? t('userCourse.feedSection.loadingMore')
                  : paginationError
                    ? t('userCourse.feedSection.loadMoreError')
                    : t('userCourse.feedSection.loadMore')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <StateComp
          img={feedImg}
          iconClassName='w-12 h-12 md:w-13 h-13'
          type='no-content'
          message={t('userCourse.feedSection.empty')}
          className='pt-8 pb-0'
        />
      )}
    </section>
  )
}

export default UserCourseFeedSection
