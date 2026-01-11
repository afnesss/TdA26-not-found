import {
  createPost,
  deletePost,
  getFeed,
  updatePost,
} from '@/api/queries/feedQueries'
import FeedItemComp from '@/components/shared/FeedItemComp'
import { FeedContentSkeleton } from '@/components/shared/loadingskeleton/DetailsSkeleton'
import StateComp from '@/components/shared/StateComp'
import DetailHeader from './DetailHeader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FeedCreateRequest, FeedItem } from '@/lib/schemas'
import { useState } from 'react'
import feedImg from '@/assets/disconnect-blue.svg'
import { toast } from 'sonner'

const FeedTab = ({
  courseId,
  activeTab,
}: {
  courseId: string
  activeTab: string
}) => {
  const queryClient = useQueryClient()
  const [draftPost, setDraftPost] = useState<FeedItem | null>(null)

  const {
    data: feed = [],
    isError: feedError,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useQuery<FeedItem[] | null>({
    queryKey: ['feed', courseId],
    queryFn: () => getFeed(courseId!),
    enabled: Boolean(courseId),
  })

  const deletePostMutation = useMutation({
    mutationFn: (variables: { courseId: string; postId: string }) =>
      deletePost(variables.courseId, variables.postId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['feed', variables.courseId],
      })
      toast.success('Přispěvek byl smazán')
    },
    onError: () => {
      toast.error('Chyba při mazání přispěvku')
    },
  })

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

    setDraftPost(null)

    const payload = data || draftPost.message

    await createPost(courseId, payload)

    queryClient.invalidateQueries({
      queryKey: ['feed', courseId],
    })
  }
  return (
    <div className='space-y-6'>
      <DetailHeader
        onButtonClick={() => {
          console.log('зробити feed')
          handleAddPost()
        }}
        title=' Informační kanál'
        gradient='accent-teal'
        buttonText='Nový příspěvek'
      />

      {feedLoading ? (
        <FeedContentSkeleton />
      ) : feedError ? (
        <StateComp
          type='error'
          onAction={() => refetchFeed()}
          message='Nepodařilo se načíst informační kanál'
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
                      if (courseId) {
                        await updatePost(courseId, feedItem.uuid, editedFeed)
                        queryClient.invalidateQueries({
                          queryKey: ['feed', courseId],
                        })
                      }
                    }}
                    onDelete={() => {
                      deletePostMutation.mutateAsync({
                        courseId,
                        postId: feedItem.uuid,
                      })
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
