import type {
  FeedItem,
  Material,
  Quiz,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from '@/lib/schemas'
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

export const getMaterialsForCourse = async (
  courseId: string,
): Promise<Material[] | null> => {
  return await apiFetch<Material[]>(`/courses/${courseId}/materials`)
}

export const getQuizzesForCourse = async (
  courseId: string,
): Promise<Quiz[] | null> => {
  return await apiFetch<Quiz[]>(`/courses/${courseId}/quizzes`)
}

export const getFeedForCourse = async (
  courseId: string,
): Promise<FeedItem[] | null> => {
  return await apiFetch<FeedItem[]>(`/courses/${courseId}/feed`)
}
