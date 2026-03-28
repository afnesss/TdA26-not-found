import type {
  FeedCreateRequest,
  FeedItem,
  FeedUpdateRequest,
} from '@/lib/schemas'
import { buildOrgApiPrefix } from '@/lib/routes'
import apiFetch from '../client'

const buildFeedApiPath = (
  courseId: string,
  orgSlug?: string,
  suffix: string = '',
) => `${buildOrgApiPrefix(orgSlug)}/courses/${courseId}/feed${suffix}`

export const getFeed = async (
  courseId: string,
  cursor?: string,
  orgSlug?: string,
): Promise<FeedItem[] | null> => {
  const url = cursor
    ? buildFeedApiPath(courseId, orgSlug, `/${cursor}`)
    : buildFeedApiPath(courseId, orgSlug)

  return await apiFetch<FeedItem[]>(url)
}

export const createPost = async (
  courseId: string,
  body: FeedCreateRequest,
  orgSlug?: string,
): Promise<FeedItem> => {
  return await apiFetch<FeedItem>(buildFeedApiPath(courseId, orgSlug), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const updatePost = async (
  courseId: string,
  postId: string,
  body: FeedUpdateRequest,
  orgSlug?: string,
): Promise<FeedItem> => {
  return await apiFetch<FeedItem>(buildFeedApiPath(courseId, orgSlug, `/${postId}`), {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const deletePost = async (
  courseId: string,
  postId: string,
  orgSlug?: string,
): Promise<void> => {
  return await apiFetch<void>(buildFeedApiPath(courseId, orgSlug, `/${postId}`), {
    method: 'DELETE',
  })
}
