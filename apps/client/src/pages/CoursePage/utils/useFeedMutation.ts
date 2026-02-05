import { createPost, deletePost, updatePost } from '@/api/queries/feedQueries'
import type { ApiError } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onError } from './helperFunctions'
import type { FeedItem } from '@/lib/schemas'

export const useCreatePostMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<FeedItem, ApiError, { message: string }>({
    mutationFn: (data: { message: string }) => createPost(courseId, data),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', courseId],
      })
      toast.success('Příspěvek vytvořen')
    },
    onError: (error: ApiError) =>
      onError(error, 'Chyba při vytváření příspěvku'),
  })
}

export const useUpdatePostMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<FeedItem, ApiError, { postId: string; data: FeedItem }>({
    mutationFn: ({ postId, data }: { postId: string; data: FeedItem }) =>
      updatePost(courseId, postId, data),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', courseId],
      })
      toast.success('Příspěvek uložen')
    },
    onError: (error: ApiError) =>
      onError(error, 'Chyba při ukládání příspěvku'),
  })
}

export const useDeletePostMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string>({
    mutationFn: (postId: string) => deletePost(courseId, postId),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed', courseId],
      })
      toast.success('Přispěvek smazán')
    },
    onError: (error: ApiError) => onError(error, 'Chyba při mazání příspěvku'),
  })
}
