import { createQuiz, deleteQuiz, updateQuiz } from '@/api/queries/quizQueries'
import type { Quiz } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onError, onErrorWithRollback } from './helperFunctions'

export const useUpdateQuizMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    Quiz,
    ApiError,
    { quizId: string; data: Quiz },
    { previousQuizzes?: Quiz[] }
  >({
    mutationFn: async ({ quizId, data }: { quizId: string; data: Quiz }) =>
      await updateQuiz(courseId!, quizId, data),
    networkMode: 'always',
    onMutate: async ({ quizId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['quizzes', courseId] })

      const previousQuizzes = queryClient.getQueryData<Quiz[]>([
        'quizzes',
        courseId,
      ])

      queryClient.setQueryData<Quiz[]>(['quizzes', courseId], (oldQuizzes) => {
        if (!oldQuizzes) return oldQuizzes
        return oldQuizzes.map((q) =>
          q.uuid === quizId ? { ...q, ...data, uuid: quizId } : q,
        )
      })

      return { previousQuizzes }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      toast.success('Kvíz aktualizován')
    },
    onError: (
      error: ApiError,
      _variables,
      context?: { previousQuizzes?: Quiz[] },
    ) => {
      onErrorWithRollback(
        error,
        'Chyba při ukládání',
        queryClient,
        ['quizzes', courseId],
        context?.previousQuizzes,
      )
    },
  })
}

export const useCreateQuizMutation = (
  courseId: string,
  setDraftQuiz: (a: Quiz | null) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation<Quiz, ApiError, Quiz, { previousQuizzes?: Quiz[] }>({
    mutationFn: async (data: Quiz) => await createQuiz(courseId!, data),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      setDraftQuiz(null)
      toast.success('Kvíz vytvořen')
    },
    onMutate: async (data: Quiz) => {
      await queryClient.cancelQueries({ queryKey: ['quizzes', courseId] })

      const previousQuizzes = queryClient.getQueryData<Quiz[]>([
        'quizzes',
        courseId,
      ])

      queryClient.setQueryData<Quiz[]>(['quizzes', courseId], (oldQuizzes) => {
        if (!oldQuizzes) return oldQuizzes
        return [
          ...oldQuizzes,
          {
            ...data,
            uuid: 'temp-' + Date.now(),
          },
        ]
      })
      return { previousQuizzes }
    },
    onError: (
      error: ApiError,
      _variables,
      context?: { previousQuizzes?: Quiz[] },
    ) => {
      onErrorWithRollback(
        error,
        'Chyba při vytváření kvízu',
        queryClient,
        ['quizzes', courseId],
        context?.previousQuizzes,
      )
    },
  })
}

export const useDeleteQuizMutation = (courseId: string) => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, string, { previousQuizzes?: Quiz[] }>({
    mutationFn: async (quizId: string) => {
      await deleteQuiz(courseId, quizId)
    },
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      toast.success('Kvíz smazán')
    },
    onMutate: async (quizId) => {
      await queryClient.cancelQueries({ queryKey: ['quizzes', courseId] })
      const previousQuizzes = queryClient.getQueryData<Quiz[]>([
        'quizzes',
        courseId,
      ])

      queryClient.setQueryData<Quiz[]>(['quizzes', courseId], (oldQuizzes) => {
        if (!oldQuizzes) return oldQuizzes
        return oldQuizzes.filter((quiz) => quiz.uuid !== quizId)
      })

      return { previousQuizzes }
    },
    onError: (
      error: ApiError,
      _variables,
      context?: { previousQuizzes?: Quiz[] },
    ) => {
      onErrorWithRollback(
        error,
        'Chyba při mazání kvízu',
        queryClient,
        ['quizzes', courseId],
        context?.previousQuizzes,
      )
    },
  })
}
