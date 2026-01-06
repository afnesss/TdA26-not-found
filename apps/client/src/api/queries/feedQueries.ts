import type {
  FeedCreateRequest,
  FeedItem,
  FeedUpdateRequest,
} from '@/lib/schemas'
import apiFetch from '../client'

export const getFeed = async (courseId: string): Promise<FeedItem[] | null> => {
  return await apiFetch<FeedItem[]>(`/courses/${courseId}/feed`)
}

export const createPost = async (
  courseId: string,
  body: FeedCreateRequest,
): Promise<FeedItem> => {
  return await apiFetch<FeedItem>(`/courses/${courseId}/feed`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const updatePost = async (
  courseId: string,
  postId: string,
  body: FeedUpdateRequest,
): Promise<FeedItem> => {
  return await apiFetch<FeedItem>(`/courses/${courseId}/feed/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const deletePost = async (
  courseId: string,
  postId: string,
): Promise<void> => {
  return await apiFetch<void>(`/courses/${courseId}/feed/${postId}`, {
    method: 'DELETE',
  })
}
