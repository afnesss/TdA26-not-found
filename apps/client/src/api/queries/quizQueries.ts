import type {
  Quiz,
  QuizAnalyticsResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from '@/lib/schemas'
import apiFetch from '../client'

export const submitQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  body: QuizSubmitRequest,
): Promise<QuizSubmitResponse | null> => {
  return await apiFetch<QuizSubmitResponse>(
    `/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export const getQuizzes = async (
  courseId: string,
  moduleId: string,
): Promise<Quiz[] | null> => {
  return await apiFetch<Quiz[]>(
    `/courses/${courseId}/modules/${moduleId}/quizzes`,
  )
}

export const createQuiz = async (
  courseId: string,
  moduleId: string,
  body: Quiz,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(
    `/courses/${courseId}/modules/${moduleId}/quizzes`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export const updateQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
  body: Quiz,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(
    `/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

export const deleteQuiz = async (
  courseId: string,
  moduleId: string,
  quizId: string,
): Promise<void> => {
  return await apiFetch<void>(
    `/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
    {
      method: 'DELETE',
    },
  )
}

export const getQuizAnalytics = async (
  courseId: string,
  moduleId: string,
  quizId: string,
): Promise<QuizAnalyticsResponse> => {
  return await apiFetch<QuizAnalyticsResponse>(
    `/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/analytics`,
  )
}
