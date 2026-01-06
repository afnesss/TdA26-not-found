import type {
  FeedItem,
  Quiz,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from '@/lib/schemas'
import apiFetch from '../client'

export const getFeedForCourse = async (
  courseId: string,
): Promise<FeedItem[] | null> => {
  return await apiFetch<FeedItem[]>(`/courses/${courseId}/feed`)
}
