import { submitQuiz } from '@/api/queries/quizQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  type CourseDetail,
  type QuizAnswer,
  QuizSubmitResponseSchema,
  type QuizSubmitResponse,
} from '@/lib/schemas'
import type { QuizStateById } from '../../../lib/types'

export function useCourseMutation(
  setQuizState?: (updater: (prev: QuizStateById) => QuizStateById) => void,
) {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    QuizSubmitResponse,
    Error,
    { courseId: string; quizId: string; answers: QuizAnswer[] },
    { previousData?: CourseDetail | undefined }
  >({
    mutationFn: async ({ courseId, quizId, answers }) => {
      const raw = await submitQuiz(courseId, quizId, { answers })

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
      return parsed.data
    },
    onMutate: ({ courseId, quizId }) => {
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
            quizzes: oldData.quizzes.map((q) =>
              q.uuid === quizId
                ? { ...q, attemptsCount: (q.attemptsCount ?? 0) + 1 }
                : q,
            ),
          }
        },
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['course', variables.courseId],
        context?.previousData,
      )
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course', variables.courseId],
      })
    },
  })

  return mutation
}
