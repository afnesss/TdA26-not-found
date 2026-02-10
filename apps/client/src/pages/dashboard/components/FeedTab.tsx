import { getFeed } from '@/api/queries/feedQueries'
import FeedItemComp from '@/components/shared/FeedItemComp'
import { FeedContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import StateComp from '@/components/shared/StateComp'
import DetailHeader from './DetailHeader'
import { useQuery } from '@tanstack/react-query'
import type { FeedItem } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useState } from 'react'
import feedImg from '@/assets/disconnect-blue.svg'
import {
  useDeletePostMutation,
  useCreatePostMutation,
  useUpdatePostMutation,
} from '@/pages/CoursePage/utils/useFeedMutation'

const FeedTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const [draftPost, setDraftPost] = useState<FeedItem | null>(null)
  const isOffline = !navigator.onLine

  const {
    data: feed = [],
    isError: feedError,
    error: feedErrorObj,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useQuery<FeedItem[] | null, ApiError>({
    queryKey: ['feed', courseId],
    queryFn: () => getFeed(courseId!),
    enabled: Boolean(courseId),
    networkMode: 'always',
  })

  const isNetworkError = feedErrorObj?.isNetworkError ?? false

  const { mutateAsync: createPostMutation } = useCreatePostMutation(courseId)
  const { mutateAsync: updatePostMutation } = useUpdatePostMutation(courseId)
  const { mutateAsync: deletePostMutation } = useDeletePostMutation(courseId)

  const handleAddPost = () => {
    const newDraft: FeedItem = {
      uuid: `temp-${Date.now()}`,
      type: 'manual',
      message: '',
      createdAt: new Date().toISOString(),
    }
    setDraftPost(newDraft)
  }
  const onSaveDraft = async (data: { message: string }) => {
    if (!draftPost || !courseId) return

    const payload = data || draftPost.message

    try {
      await createPostMutation(payload)
      setDraftPost(null)
    } catch (error) {
      // Error handled by mutation, keep draft on error
    }
  }
  return (
    <div className='space-y-6'>
      <DetailHeader
        onButtonClick={() => {
          handleAddPost()
        }}
        title=' Informační kanál'
        gradient='accent-teal'
        buttonText='Nový příspěvek'
        aria-label='Add new feed post'
      />

      {feedLoading ? (
        <FeedContentSkeleton />
      ) : isOffline && feed?.length === 0 ? (
        <StateComp type='network-offline' onAction={() => refetchFeed()} />
      ) : feedError ? (
        <StateComp
          type={isNetworkError ? 'network-offline' : 'error'}
          onAction={() => refetchFeed()}
          message={
            isNetworkError ? undefined : 'Nepodařilo se načíst informační kanál'
          }
        />
      ) : (feed && feed.length > 0) || draftPost ? (
        <div className='bg-background rounded-xl shadow-md p-2 sm:p-3 md:p-5'>
          <div className='space-y-4'>
            {draftPost && (
              <FeedItemComp
                key={draftPost.uuid}
                feedItem={draftPost}
                type='edit'
                onSave={onSaveDraft}
                isDraft
                onCancelDraft={() => setDraftPost(null)}
              />
            )}
            {feed && feed.length > 0 && (
              <>
                {feed.map((feedItem) => (
                  <FeedItemComp
                    feedItem={feedItem}
                    key={feedItem.uuid}
                    type='edit'
                    onSave={async (editedFeed) => {
                      await updatePostMutation({
                        postId: feedItem.uuid,
                        data: editedFeed,
                      })
                    }}
                    onDelete={() => {
                      deletePostMutation(feedItem.uuid)
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        <StateComp
          img={feedImg}
          iconClassName='w-12 h-12 md:w-13 h-13'
          type='no-content'
          message='Zatím žádné přispěvky'
        />
      )}
    </div>
  )
}

export default FeedTab
