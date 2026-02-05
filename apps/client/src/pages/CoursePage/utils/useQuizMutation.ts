import { createQuiz, deleteQuiz, updateQuiz } from '@/api/queries/quizQueries'
import type { Quiz } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onError } from './helperFunctions'

export const useUpdateQuizMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<Quiz, ApiError, { quizId: string; data: Quiz }>({
    mutationFn: async ({ quizId, data }: { quizId: string; data: Quiz }) =>
      await updateQuiz(courseId!, quizId, data),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      toast.success('Kvíz aktualizován')
    },
    onError: (error: ApiError) => onError(error, 'Chyba při ukládání'),
  })
}

export const useCreateQuizMutation = (
  courseId: string,
  setDraftQuiz: (a: Quiz | null) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation<Quiz, ApiError, Quiz>({
    mutationFn: async (data: Quiz) => await createQuiz(courseId!, data),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      setDraftQuiz(null)
      toast.success('Kvíz vytvořen')
    },
    onError: (error: ApiError) => onError(error, 'Chyba při vytváření kvízu'),
  })
}

export const useDeleteQuizMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string>({
    mutationFn: async (quizId: string) => {
      await deleteQuiz(courseId, quizId)
    },
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      toast.success('Kvíz smazán')
    },
    onError: (error: ApiError) => onError(error, 'Chyba při mazání kvízu'),
  })
}
