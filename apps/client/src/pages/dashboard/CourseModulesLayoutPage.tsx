import { getCourseById } from '@/api/queries/courseQueries'
import { useCourseFeedSSE } from '@/api/useCourseFeedSSE'
import FeedItemComp from '@/components/shared/FeedItemComp'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { colorStyles } from '@/lib/constants'
import type { CourseDetail, FeedItem, StatusHistoryEvent } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import type { ApiError } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Outlet, useParams, useMatch } from 'react-router-dom'
import {
  useCreatePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
} from '../CoursePage/utils/useFeedMutation'
import { useFeedPagination } from '../CoursePage/utils/useFeedPagination'
import { fmt } from '../CoursePage/utils/helperFunctions'
import type { CourseModulesLayoutContext } from './CourseModulesLayoutContext'
import DashboardAddButton from './components/DashboardAddButton'

type QueryError = Error & { status?: number }

const CourseModulesLayoutPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  useCourseFeedSSE({ courseId: courseId! })
  const [sideTab, setSideTab] = useState<'feed' | 'history'>('feed')
  const [draftPost, setDraftPost] = useState<FeedItem | null>(null)

  const isModuleDetailPage = useMatch('/dashboard/:courseId/modules/:moduleId')

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    error: courseQueryError,
    refetch: refetchCourse,
  } = useQuery<CourseDetail, QueryError>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: Boolean(courseId),
    networkMode: 'always',
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  const {
    allPosts,
    loadMorePosts,
    hasMore,
    isLoadingMore,
    paginationError,
    isLoading: feedLoading,
    isError: feedError,
    error: feedErrorObj,
    refetch: refetchFeed,
  } = useFeedPagination(courseId ?? '', undefined, Boolean(courseId))

  const isNetworkError = (feedErrorObj as ApiError)?.isNetworkError ?? false
  const isFeedOfflineError = isNetworkError || isOffline
  const shouldSuppressFeedNetworkError =
    isModuleDetailPage && isFeedOfflineError
  const hasCourseError = courseError || !course

  const { mutateAsync: createPostMutation } = useCreatePostMutation(
    courseId ?? '',
  )
  const { mutateAsync: updatePostMutation } = useUpdatePostMutation(
    courseId ?? '',
  )
  const { mutateAsync: deletePostMutation } = useDeletePostMutation(
    courseId ?? '',
  )

  const historyItems = useMemo(
    () => course?.status_history ?? [],
    [course?.status_history],
  )

  if (!courseId) {
    return <StateComp type='not-found' message='Kurz nebyl nalezen' />
  }

  if (!courseLoading && (courseError || !course)) {
    const isNotFound = courseQueryError?.status === 404
    return (
      <StateComp
        type={
          isNotFound ? 'not-found' : isOffline ? 'network-offline' : 'error'
        }
        message={isNotFound ? 'Kurz nebyl nalezen' : undefined}
        onAction={() => refetchCourse()}
      />
    )
  }

  if (courseLoading && !course) {
    return (
      <Outlet
        context={
          {
            courseId,
            course: null,
            modules: undefined,
            isLoading: true,
            isError: false,
            refetchCourse,
            previewMode: false,
            courseIndexColor: isModuleDetailPage
              ? 'accent-teal'
              : 'accent-teal-dark',
          } as CourseModulesLayoutContext
        }
      />
    )
  }

  if (!course) {
    return <StateComp type='error' onAction={() => refetchCourse()} />
  }

  const previewMode = course.status !== 'draft'
  const canManageFeed = course.status === 'draft' || course.status === 'live'
  const courseIndexColor: keyof typeof colorStyles.gradient = isModuleDetailPage
    ? 'accent-teal'
    : 'accent-teal-dark'

  const handleAddPost = () => {
    if (!canManageFeed || draftPost) return

    setDraftPost({
      uuid: `temp-${Date.now()}`,
      type: 'manual',
      message: '',
      createdAt: new Date().toISOString(),
    })
  }

  const onSaveDraft = async (post: FeedItem) => {
    await createPostMutation({ message: post.message })
    setDraftPost(null)
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='space-y-5'>
        <Outlet
          context={{
            courseId,
            course,
            modules: course?.modules,
            isLoading: courseLoading,
            isError: courseError,
            refetchCourse,
            previewMode,
            courseIndexColor,
          }}
        />

        <Card className='border border-border/60 shadow-md bg-background'>
          <div
            className={`h-2 bg-linear-to-r ${colorStyles.gradient[courseIndexColor]}`}
          />
          <div className='p-3 md:p-5 space-y-4'>
            <div className='flex justify-between gap-3'>
              <div className='flex gap-2'>
                <Button
                  variant='filter'
                  size='sm'
                  className={cn(
                    'whitespace-nowrap rounded-xl',
                    sideTab === 'feed'
                      ? 'bg-primary text-background shadow-md'
                      : 'bg-background text-primary hover:bg-gray-50 border border-gray-200',
                  )}
                  onClick={() => setSideTab('feed')}
                >
                  Oznámení
                </Button>
                <Button
                  variant='filter'
                  size='sm'
                  className={cn(
                    'whitespace-nowrap rounded-xl',
                    sideTab === 'history'
                      ? 'bg-primary text-background shadow-md'
                      : 'bg-background text-primary hover:bg-gray-50 border border-gray-200',
                  )}
                  onClick={() => setSideTab('history')}
                >
                  Historie
                </Button>
              </div>
              {canManageFeed && sideTab === 'feed' && (
                <DashboardAddButton
                  label={'Přidat příspěvek'}
                  className='h-fit'
                  onClick={handleAddPost}
                  disabled={Boolean(draftPost)}
                />
              )}
            </div>

            {sideTab === 'feed' && !hasCourseError ? (
              <div className='space-y-3'>
                {feedLoading ? (
                  <StateComp
                    type='no-content'
                    message='Načítání příspěvků...'
                    className='pt-8 pb-0'
                  />
                ) : feedError ? (
                  shouldSuppressFeedNetworkError ? (
                    <StateComp
                      type='no-content'
                      message='Příspěvky nejsou dostupné'
                      className='pt-8 pb-0'
                    />
                  ) : (
                    <StateComp
                      type={isFeedOfflineError ? 'network-offline' : 'error'}
                      message={
                        isFeedOfflineError
                          ? undefined
                          : 'Nepodařilo se načíst příspěvky'
                      }
                      onAction={() => {
                        refetchFeed()
                      }}
                      className='pt-8 pb-0'
                    />
                  )
                ) : (allPosts && allPosts.length > 0) || draftPost ? (
                  <>
                    {draftPost && (
                      <FeedItemComp
                        key={draftPost.uuid}
                        feedItem={draftPost}
                        type='edit'
                        isDraft
                        onSave={onSaveDraft}
                        onCancelDraft={() => setDraftPost(null)}
                      />
                    )}
                    {allPosts.map((item) => {
                      if (!item) return
                      return (
                        <FeedItemComp
                          key={item.uuid}
                          feedItem={item}
                          type={canManageFeed ? 'edit' : 'classic'}
                          onSave={async (editedFeed) => {
                            await updatePostMutation({
                              postId: item.uuid,
                              data: editedFeed,
                            })
                          }}
                          onDelete={() => {
                            deletePostMutation(item.uuid)
                          }}
                        />
                      )
                    })}
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
                  </>
                ) : (
                  <StateComp
                    type='no-content'
                    message='Zatím žádné příspěvky'
                    className='pt-8 pb-0'
                  />
                )}
              </div>
            ) : sideTab === 'feed' && hasCourseError ? (
              <StateComp
                type='no-content'
                message='Příspěvky nejsou dostupné'
                className='pt-8 pb-0'
              />
            ) : (
              <div className='space-y-3'>
                {historyItems.length ? (
                  historyItems.map((event: StatusHistoryEvent, index) => (
                    <div
                      key={`${String(event.timestamp)}-${event.status}-${index}`}
                      className='rounded-xl border border-border/60 bg-muted/20 p-3'
                    >
                      <p className='text-sm font-semibold text-neutral-black'>
                        Stav kurzu změněn na {event.status}
                      </p>
                      {event.note && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          {event.note}
                        </p>
                      )}
                      <p className='text-[11px] text-muted-foreground mt-2'>
                        {fmt(String(event.timestamp))}
                      </p>
                    </div>
                  ))
                ) : (
                  <StateComp
                    type='no-content'
                    message='Zatím žádná historie'
                    className='pt-8 pb-0'
                  />
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CourseModulesLayoutPage
