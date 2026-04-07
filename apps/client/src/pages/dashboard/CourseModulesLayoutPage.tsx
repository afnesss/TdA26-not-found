import { getCourseById } from '@/api/queries/courseQueries'
import { useCourseFeedSSE } from '@/api/useCourseFeedSSE'
import FeedItemComp from '@/components/shared/FeedItemComp'
import StateComp from '@/components/shared/StateComp'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import UnderlinedText from '@/components/shared/UnderlinedText'
import { colorStyles } from '@/lib/constants'
import type { CourseDetail, FeedItem, StatusHistoryEvent } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useParams, useMatch } from 'react-router-dom'
import feedImg from '@/assets/disconnect-blue.svg'
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
  const { t } = useTranslation('dashboard')
  const { orgSlug, courseId } = useParams<{ orgSlug?: string; courseId: string }>()
  useCourseFeedSSE({
    courseId: courseId!,
    orgSlug,
    syncModuleActivation: false,
    showNewPostToast: false,
    showSseToasts: false,
  })
  const [sideTab, setSideTab] = useState<'feed' | 'history'>('feed')
  const [draftPost, setDraftPost] = useState<FeedItem | null>(null)

  const isModuleDetailPage = useMatch('/:orgSlug/dashboard/:courseId/modules/:moduleId')

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    error: courseQueryError,
    refetch: refetchCourse,
  } = useQuery<CourseDetail, QueryError>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!, orgSlug),
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
  } = useFeedPagination(courseId ?? '', undefined, orgSlug, Boolean(courseId))

  const isNetworkError = (feedErrorObj as ApiError)?.isNetworkError ?? false
  const isFeedOfflineError = isNetworkError || isOffline
  const shouldSuppressFeedNetworkError =
    isModuleDetailPage && isFeedOfflineError
  const hasCourseError = courseError || !course

  const { mutateAsync: createPostMutation } = useCreatePostMutation(
    courseId ?? '',
    orgSlug,
  )
  const { mutateAsync: updatePostMutation } = useUpdatePostMutation(
    courseId ?? '',
    orgSlug,
  )
  const { mutateAsync: deletePostMutation } = useDeletePostMutation(
    courseId ?? '',
    orgSlug,
  )

  const historyItems = useMemo(() => {
    const items = course?.status_history ?? []
    return [...items].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }, [course?.status_history])

  if (!courseId) {
    return <StateComp type='not-found' message={t('courseOverview.sidePanel.courseNotFound')} />
  }

  if (!courseLoading && (courseError || !course)) {
    const isNotFound = courseQueryError?.status === 404
    return (
      <StateComp
        type={
          isNotFound ? 'not-found' : isOffline ? 'network-offline' : 'error'
        }
        message={isNotFound ? t('courseOverview.sidePanel.courseNotFound') : undefined}
        onAction={() => refetchCourse()}
      />
    )
  }

  if (courseLoading && !course) {
    return (
      <div className='max-w-7xl mx-auto'>
        <div className='space-y-5'>
          <Outlet
            context={
              {
                courseId,
                course: null,
                modules: undefined,
                isConnected: true,
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
        </div>
      </div>
    )
  }

  if (!course) {
    return <StateComp type='error' onAction={() => refetchCourse()} />
  }

  const previewMode = course.status !== 'draft'
  const canManageFeed = course.status === 'draft' || course.status === 'live'
  const courseIndexColor: keyof typeof colorStyles.line =
    course.status === 'live'
      ? 'secondary'
      : course.status === 'paused'
        ? 'accent-teal'
        : course.status === 'planned'
          ? 'primary'
          : 'gray'

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
            isConnected: true,
            isLoading: courseLoading,
            isError: courseError,
            refetchCourse,
            previewMode,
            courseIndexColor,
          }}
        />

        <div className='flex items-center justify-between gap-3'>
          <Label className='font-bold text-lg md:text-xl text-neutral-black'>
            <UnderlinedText height='10' strokeWidth='4' offset='-bottom-0.5'>
              {sideTab === 'feed'
                ? t('courseOverview.sidePanel.feed')
                : t('courseOverview.sidePanel.history')}
            </UnderlinedText>
          </Label>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl'
              onClick={() =>
                setSideTab(sideTab === 'feed' ? 'history' : 'feed')
              }
            >
              {sideTab === 'feed'
                ? t('courseOverview.sidePanel.history')
                : t('courseOverview.sidePanel.feed')}
            </Button>
            {canManageFeed && sideTab === 'feed' && (
              <DashboardAddButton
                label={t('courseOverview.sidePanel.addPost')}
                className='h-fit'
                onClick={handleAddPost}
                disabled={Boolean(draftPost)}
              />
            )}
          </div>
        </div>

        <Card className='border border-border/60 shadow-md bg-background'>
          <div className='p-3 md:p-5 space-y-4'>
            {sideTab === 'feed' && !hasCourseError ? (
              <div className='space-y-3'>
                {feedLoading ? (
                  <StateComp
                    type='no-content'
                    message={t('courseOverview.sidePanel.postsLoading')}
                    className='pt-8 pb-0'
                  />
                ) : feedError ? (
                  shouldSuppressFeedNetworkError ? (
                    <StateComp
                      type='no-content'
                      message={t('courseOverview.sidePanel.postsUnavailable')}
                      className='pt-8 pb-0'
                    />
                  ) : (
                    <StateComp
                      type={isFeedOfflineError ? 'network-offline' : 'error'}
                      message={
                        isFeedOfflineError
                          ? undefined
                          : t('courseOverview.sidePanel.postsLoadError')
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
                      if (!item) return null
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
                            ? t('courseOverview.sidePanel.loadMoreLoading')
                            : paginationError
                              ? t('courseOverview.sidePanel.loadMoreError')
                              : t('courseOverview.sidePanel.loadMorePosts')}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <StateComp
                    type='no-content'
                    img={feedImg}
                    iconClassName='w-12 h-12 md:w-13 h-13'
                    message={t('courseOverview.sidePanel.noPosts')}
                    className='pt-8 pb-0'
                  />
                )}
              </div>
            ) : sideTab === 'feed' && hasCourseError ? (
              <StateComp
                type='no-content'
                message={t('courseOverview.sidePanel.postsUnavailable')}
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
                        {t('courseOverview.sidePanel.historyStatusChanged', {
                          status: event.status,
                        })}
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
                    message={t('courseOverview.sidePanel.historyEmpty')}
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
