import type {
  Quiz,
  QuizAnalyticsResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from '@/lib/schemas'
import { buildOrgApiPrefix } from '@/lib/routes'
import apiFetch from '../client'

const buildQuizApiPath = (
  courseId: string,
  moduleId: string,
  orgSlug?: string,
  suffix: string = '',
) =>
  `${buildOrgApiPrefix(orgSlug)}/courses/${courseId}/modules/${moduleId}/quizzes${suffix}`

export const submitQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  body: QuizSubmitRequest,
  orgSlug?: string,
): Promise<QuizSubmitResponse | null> => {
  return await apiFetch<QuizSubmitResponse>(
    buildQuizApiPath(courseId, moduleId, orgSlug, `/${quizId}/submit`),
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export const getQuizzes = async (
  courseId: string,
  moduleId: string,
  orgSlug?: string,
): Promise<Quiz[] | null> => {
  return await apiFetch<Quiz[]>(buildQuizApiPath(courseId, moduleId, orgSlug))
}

export const createQuiz = async (
  courseId: string,
  moduleId: string,
  body: Quiz,
  orgSlug?: string,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(buildQuizApiPath(courseId, moduleId, orgSlug), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const updateQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  body: Quiz,
  orgSlug?: string,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(buildQuizApiPath(courseId, moduleId, orgSlug, `/${quizId}`), {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const deleteQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  orgSlug?: string,
): Promise<void> => {
  return await apiFetch<void>(buildQuizApiPath(courseId, moduleId, orgSlug, `/${quizId}`), {
    method: 'DELETE',
  })
}

export const getQuizAnalytics = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  orgSlug?: string,
): Promise<QuizAnalyticsResponse> => {
  return await apiFetch<QuizAnalyticsResponse>(
    buildQuizApiPath(courseId, moduleId, orgSlug, `/${quizId}/analytics`),
  )
}
