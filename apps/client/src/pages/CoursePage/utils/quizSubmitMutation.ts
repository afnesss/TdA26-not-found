import { submitQuiz } from '@/api/queries/quizQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type CourseDetail,
  type QuizAnswer,
  QuizSubmitResponseSchema,
  type QuizSubmitResponse,
} from '@/lib/schemas'
import type { ApiError } from '@/lib/types'
import type { QuizStateById } from '../../../lib/types'
import { toast } from 'sonner'
import { onErrorWithRollback } from './helperFunctions'
import { setQuizSubmission } from './quizSubmissionStorage'

export function useQuizSubmitMutation(
  setQuizState?: (updater: (prev: QuizStateById) => QuizStateById) => void,
) {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    QuizSubmitResponse,
    ApiError,
    {
      courseId: string
      moduleId: string
      quizId: string
      answers: QuizAnswer[]
      accountScope?: string
    },
    { previousData?: CourseDetail | undefined }
  >({
    mutationFn: async ({ courseId, moduleId, quizId, answers, accountScope }) => {
      const raw = await submitQuiz(courseId, moduleId, quizId, {
        answers,
      })

      const parsed = QuizSubmitResponseSchema.safeParse(raw)

      if (!parsed.success) {
        console.error(
          'quizResponseSubmit schema validation failed',
          parsed.error,
        )
        throw new Error('Invalid data to submit')
      }

      setQuizState?.((prev) => ({
        ...prev,
        [quizId]: {
          ...prev?.[quizId],
          status: 'submitted',
          results: parsed.data,
          showCorrect: false,
        },
      }))
      setQuizSubmission(quizId, parsed.data, answers, accountScope)

      return parsed.data
    },
    networkMode: 'always',
    onMutate: ({ courseId, moduleId, quizId }) => {
      const previousData = queryClient.getQueryData<CourseDetail | undefined>([
        'course',
        courseId,
      ])

      queryClient.setQueryData<CourseDetail | undefined>(
        ['course', courseId],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            modules: oldData.modules.map((module) =>
              module.uuid !== moduleId
                ? module
                : {
                    ...module,
                    quizzes: module.quizzes.map((q) =>
                      q.uuid === quizId
                        ? { ...q, attemptsCount: (q.attemptsCount ?? 0) + 1 }
                        : q,
                    ),
                  },
            ),
          }
        },
      )

      return { previousData }
    },
    onError: (error, variables, context) => {
      onErrorWithRollback(
        error,
        'Chyba při odesílání kvízu',
        queryClient,
        ['course', variables.courseId],
        context?.previousData,
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course', variables.courseId],
      })
      queryClient.invalidateQueries({
        queryKey: ['course-session-leaderboard', variables.courseId],
      })
      queryClient.invalidateQueries({
        queryKey: ['course-session-overview', variables.courseId],
      })
      queryClient.invalidateQueries({
        queryKey: ['auth', 'me'],
      })
      toast.success('Kvíz byl odeslán')
    },
  })

  return mutation
}
