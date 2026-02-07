import { createPost, deletePost, updatePost } from '@/api/queries/feedQueries'
import type { ApiError } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onError, onErrorWithRollback } from './helperFunctions'
import type { FeedItem } from '@/lib/schemas'

export const useCreatePostMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    FeedItem,
    ApiError,
    { message: string },
    { previousFeed?: FeedItem[] }
  >({
    mutationFn: (data: { message: string }) => createPost(courseId, data),
    networkMode: 'always',
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['feed', courseId] })

      const previousFeed = queryClient.getQueryData<FeedItem[]>([
        'feed',
        courseId,
      ])

      const optimisticPost: FeedItem = {
        uuid: 'temp-' + Date.now(),
        message: data.message,
        createdAt: new Date().toISOString(),
        type: 'manual',
      }

      queryClient.setQueryData<FeedItem[]>(['feed', courseId], (oldFeed) => {
        if (!oldFeed) return oldFeed
        return [optimisticPost, ...oldFeed]
      })

      return { previousFeed }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', courseId],
      })
      toast.success('Příspěvek vytvořen')
    },

    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při vytváření příspěvku',
        queryClient,
        ['feed', courseId],
        context?.previousFeed,
      )
    },
  })
}

export const useUpdatePostMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    FeedItem,
    ApiError,
    { postId: string; data: FeedItem },
    { previousFeed?: FeedItem[] }
  >({
    mutationFn: ({ postId, data }: { postId: string; data: FeedItem }) =>
      updatePost(courseId, postId, data),
    networkMode: 'always',
    onMutate: async ({ postId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['feed', courseId] })

      const previousFeed = queryClient.getQueryData<FeedItem[]>([
        'feed',
        courseId,
      ])

      queryClient.setQueryData<FeedItem[]>(['feed', courseId], (oldFeed) => {
        if (!oldFeed) return oldFeed
        return oldFeed.map((item) =>
          item.uuid === postId ? { ...item, ...data } : item,
        )
      })

      return { previousFeed }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', courseId],
      })
      toast.success('Příspěvek uložen')
    },

    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při ukládání příspěvku',
        queryClient,
        ['feed', courseId],
        context?.previousFeed,
      )
    },
  })
}

export const useDeletePostMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string, { previousFeed?: FeedItem[] }>({
    mutationFn: (postId: string) => deletePost(courseId, postId),
    networkMode: 'always',
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed', courseId] })

      const previousFeed = queryClient.getQueryData<FeedItem[]>([
        'feed',
        courseId,
      ])

      queryClient.setQueryData<FeedItem[]>(['feed', courseId], (oldFeed) => {
        if (!oldFeed) return oldFeed
        return oldFeed.filter((item) => item.uuid !== postId)
      })

      return { previousFeed }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', courseId],
      })
      toast.success('Přispěvek smazán')
    },
    onError: (error: ApiError, _variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při mazání příspěvku',
        queryClient,
        ['feed', courseId],
        context?.previousFeed,
      )
    },
  })
}
