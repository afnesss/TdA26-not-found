import FeedItemComp from '@/components/shared/FeedItemComp'
import StateComp from '@/components/shared/StateComp'
import { Label } from '@/components/ui/label'
import type { FeedItem } from '@/lib/schemas'
import feedImg from '@/assets/disconnect-blue.svg'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'react-router'
import { useFeedPagination } from '../utils/useFeedPagination'

type FeedSectionProps = {
  feed: FeedItem[]
  isConnected?: boolean
}

const FeedSection = ({ feed, isConnected }: FeedSectionProps) => {
  const { id: courseId } = useParams()
  const { allPosts, loadMorePosts, hasMore, isLoadingMore, paginationError } =
    useFeedPagination(courseId!, feed)

  return (
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
                  loadMorePosts()
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
  )
}

export default FeedSection
