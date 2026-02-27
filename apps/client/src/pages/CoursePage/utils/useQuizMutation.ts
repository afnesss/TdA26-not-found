import { createQuiz, deleteQuiz, updateQuiz } from '@/api/queries/quizQueries'
import type { Quiz } from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onErrorWithRollback } from './helperFunctions'

const getQuizzesQueryKey = (courseId: string, moduleId: string) => [
  'quizzes',
  courseId,
  moduleId,
]

const getCourseModuleQueryKey = (courseId: string, moduleId: string) => [
  'course-module',
  courseId,
  moduleId,
]

export const useUpdateQuizMutation = (courseId: string, moduleId: string) => {
  const queryClient = useQueryClient()
  const quizzesQueryKey = getQuizzesQueryKey(courseId, moduleId)
  // const modulesQueryKey = getCourseModulesQueryKey(courseId)
  const moduleQueryKey = getCourseModuleQueryKey(courseId, moduleId)
  return useMutation<
    Quiz,
    ApiError,
    { quizId: string; data: Quiz },
    { previousQuizzes?: Quiz[] }
  >({
    mutationFn: async ({ quizId, data }: { quizId: string; data: Quiz }) =>
      await updateQuiz(courseId!, moduleId, quizId, data),
    networkMode: 'always',
    onMutate: async ({ quizId, data }) => {
      await queryClient.cancelQueries({ queryKey: quizzesQueryKey })

      const previousQuizzes = queryClient.getQueryData<Quiz[]>(quizzesQueryKey)

      queryClient.setQueryData<Quiz[]>(quizzesQueryKey, (oldQuizzes) => {
        if (!oldQuizzes) return oldQuizzes
        return oldQuizzes.map((q) =>
          q.uuid === quizId ? { ...q, ...data, uuid: quizId } : q,
        )
      })

      return { previousQuizzes }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizzesQueryKey })
      queryClient.invalidateQueries({ queryKey: moduleQueryKey })
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
        quizzesQueryKey,
        context?.previousQuizzes,
      )
    },
  })
}

export const useCreateQuizMutation = (
  courseId: string,
  moduleId: string,
  setDraftQuiz: (a: Quiz | null) => void,
) => {
  const queryClient = useQueryClient()
  const quizzesQueryKey = getQuizzesQueryKey(courseId, moduleId)
  const moduleQueryKey = getCourseModuleQueryKey(courseId, moduleId)

  return useMutation<Quiz, ApiError, Quiz, { previousQuizzes?: Quiz[] }>({
    mutationFn: async (data: Quiz) =>
      await createQuiz(courseId!, moduleId, data),
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizzesQueryKey })
      queryClient.invalidateQueries({ queryKey: moduleQueryKey })

      setDraftQuiz(null)
      toast.success('Kvíz vytvořen')
    },
    onMutate: async (data: Quiz) => {
      await queryClient.cancelQueries({ queryKey: quizzesQueryKey })

      const previousQuizzes = queryClient.getQueryData<Quiz[]>(quizzesQueryKey)

      queryClient.setQueryData<Quiz[]>(quizzesQueryKey, (oldQuizzes) => {
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
        quizzesQueryKey,
        context?.previousQuizzes,
      )
    },
  })
}

export const useDeleteQuizMutation = (courseId: string, moduleId: string) => {
  const queryClient = useQueryClient()
  const quizzesQueryKey = getQuizzesQueryKey(courseId, moduleId)
  const moduleQueryKey = getCourseModuleQueryKey(courseId, moduleId)

  return useMutation<void, ApiError, string, { previousQuizzes?: Quiz[] }>({
    mutationFn: async (quizId: string) => {
      await deleteQuiz(courseId, moduleId, quizId)
    },
    networkMode: 'always',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizzesQueryKey })
      queryClient.invalidateQueries({ queryKey: moduleQueryKey })

      toast.success('Kvíz smazán')
    },
    onMutate: async (quizId) => {
      await queryClient.cancelQueries({ queryKey: quizzesQueryKey })
      const previousQuizzes = queryClient.getQueryData<Quiz[]>(quizzesQueryKey)

      queryClient.setQueryData<Quiz[]>(quizzesQueryKey, (oldQuizzes) => {
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
        quizzesQueryKey,
        context?.previousQuizzes,
      )
    },
  })
}
