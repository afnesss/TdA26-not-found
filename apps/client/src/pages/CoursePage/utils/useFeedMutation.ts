import { createPost, deletePost, updatePost } from '@/api/queries/feedQueries'
import i18n from '@/i18n'
import { getStoredUiLocale } from '@/lib/i18n'
import type { ApiError } from '@/lib/types'
import {
  QueryClient,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { onError, onErrorWithRollback } from './helperFunctions'
import type { FeedItem } from '@/lib/schemas'

const invalidateQueries = (
  queryClient: QueryClient,
  courseId: string,
  orgSlug?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ['feed-paginated', orgSlug, courseId],
  })
  queryClient.invalidateQueries({
    queryKey: ['course-feed', courseId],
  })
}

export const useCreatePostMutation = (courseId: string, orgSlug?: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    FeedItem,
    ApiError,
    { message: string },
    { previousFeed?: InfiniteData<FeedItem[]> }
  >({
    mutationFn: (data: { message: string }) =>
      createPost(
        courseId,
        {
          ...data,
          sourceLocale: getStoredUiLocale(),
        },
        orgSlug,
      ),
    networkMode: 'always',
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ['feed-paginated', orgSlug, courseId],
      })

      const previousFeed = queryClient.getQueryData<InfiniteData<FeedItem[]>>([
        'feed-paginated',
        orgSlug,
        courseId,
      ])

      const optimisticPost: FeedItem = {
        uuid: 'temp-' + Date.now(),
        message: data.message,
        createdAt: new Date().toISOString(),
        type: 'manual',
      }

      queryClient.setQueryData<InfiniteData<FeedItem[]>>(
        ['feed-paginated', orgSlug, courseId],
        (oldData) => {
          if (!oldData?.pages) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) =>
              index === 0 ? [optimisticPost, ...page] : page,
            ),
          }
        },
      )

      return { previousFeed }
    },
    onSuccess: () => {
      invalidateQueries(queryClient, courseId, orgSlug)
      toast.success(i18n.t('toasts.feed.created', { ns: 'dashboard' }))
    },

    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        i18n.t('toasts.feed.createError', { ns: 'dashboard' }),
        queryClient,
        ['feed-paginated', orgSlug, courseId],
        context?.previousFeed,
      )
    },
  })
}

export const useUpdatePostMutation = (courseId: string, orgSlug?: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    FeedItem,
    ApiError,
    { postId: string; data: FeedItem },
    { previousFeed?: InfiniteData<FeedItem[]> }
  >({
    mutationFn: ({ postId, data }: { postId: string; data: FeedItem }) =>
      updatePost(courseId, postId, data, orgSlug),
    networkMode: 'always',
    onMutate: async ({ postId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ['feed-paginated', orgSlug, courseId],
      })

      const previousFeed = queryClient.getQueryData<InfiniteData<FeedItem[]>>([
        'feed-paginated',
        orgSlug,
        courseId,
      ])

      queryClient.setQueryData<InfiniteData<FeedItem[]>>(
        ['feed-paginated', orgSlug, courseId],
        (oldData) => {
          if (!oldData?.pages) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((item) =>
                item.uuid === postId ? { ...item, ...data } : item,
              ),
            ),
          }
        },
      )

      return { previousFeed }
    },
    onSuccess: () => {
      invalidateQueries(queryClient, courseId, orgSlug)
      toast.success(i18n.t('toasts.feed.updated', { ns: 'dashboard' }))
    },

    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        i18n.t('toasts.feed.updateError', { ns: 'dashboard' }),
        queryClient,
        ['feed-paginated', orgSlug, courseId],
        context?.previousFeed,
      )
    },
  })
}

export const useDeletePostMutation = (courseId: string, orgSlug?: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    void,
    ApiError,
    string,
    { previousFeed?: InfiniteData<FeedItem[]> }
  >({
    mutationFn: (postId: string) => deletePost(courseId, postId, orgSlug),
    networkMode: 'always',
    onMutate: async (postId) => {
      await queryClient.cancelQueries({
        queryKey: ['feed-paginated', orgSlug, courseId],
      })

      const previousFeed = queryClient.getQueryData<InfiniteData<FeedItem[]>>([
        'feed-paginated',
        orgSlug,
        courseId,
      ])

      queryClient.setQueryData<InfiniteData<FeedItem[]>>(
        ['feed-paginated', orgSlug, courseId],
        (oldData) => {
          if (!oldData?.pages) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.filter((item) => item.uuid !== postId),
            ),
          }
        },
      )

      return { previousFeed }
    },
    onSuccess: () => {
      invalidateQueries(queryClient, courseId, orgSlug)
      toast.success(i18n.t('toasts.feed.deleted', { ns: 'dashboard' }))
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        i18n.t('toasts.feed.deleteError', { ns: 'dashboard' }),
        queryClient,
        ['feed-paginated', orgSlug, courseId],
        context?.previousFeed,
      )
    },
  })
}
