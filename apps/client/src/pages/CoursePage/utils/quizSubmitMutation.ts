import { submitQuiz } from '@/api/queries/quizQueries'
import i18n from '@/i18n'
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
  orgSlug?: string,
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
        i18n.t('toasts.quiz.submitError', { ns: 'dashboard' }),
        queryClient,
        ['course', variables.courseId],
        context?.previousData,
      )
    },
    onSuccess: (data, variables) => {
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
      if (orgSlug) {
        if (data.participantXp != null && data.participantLevel != null) {
          queryClient.setQueryData(['org-auth', orgSlug], (previous: unknown) => {
            if (
              !previous ||
              typeof previous !== 'object' ||
              (previous as { actorType?: unknown }).actorType !==
                'organization_user' ||
              (previous as { role?: unknown }).role !== 'student'
            ) {
              return previous
            }

            return {
              ...(previous as Record<string, unknown>),
              xp: data.participantXp,
              level: data.participantLevel,
            }
          })
        }

        queryClient.invalidateQueries({
          queryKey: ['org-auth', orgSlug],
        })
      }
      toast.success(i18n.t('quizComponent.submitted', { ns: 'common' }))
    },
  })

  return mutation
}
