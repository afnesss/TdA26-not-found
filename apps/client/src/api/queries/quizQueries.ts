import type { Quiz, QuizSubmitRequest, QuizSubmitResponse } from '@/lib/schemas'
import apiFetch from '../client'

export const submitQuiz = async (
  courseId: string,
  quizId: string,
  body: QuizSubmitRequest,
): Promise<QuizSubmitResponse | null> => {
  return await apiFetch<QuizSubmitResponse>(
    `/courses/${courseId}/quizzes/${quizId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export const getQuizzes = async (courseId: string): Promise<Quiz[] | null> => {
  return await apiFetch<Quiz[]>(`/courses/${courseId}/quizzes`)
}

export const createQuiz = async (
  courseId: string,
  body: Quiz,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(`/courses/${courseId}/quizzes`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const updateQuiz = async (
  courseId: string,
  quizId: string,
  body: Quiz,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(`/courses/${courseId}/quizzes/${quizId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const deleteQuiz = async (
  courseId: string,
  quizId: string,
): Promise<Quiz> => {
  return await apiFetch<Quiz>(`/courses/${courseId}/quizzes/${quizId}`, {
    method: 'DELETE',
  })
}
