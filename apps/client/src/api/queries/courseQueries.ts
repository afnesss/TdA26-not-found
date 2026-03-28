import type {
  CourseCreateRequest,
  CourseDashboardAnalytics,
  CourseDetail,
  CourseShareLink,
  CourseShareResolve,
  CourseSummary,
  CourseUpdateRequest,
} from '@/lib/schemas'
import apiFetch from '../client'

export type CourseLeaderboardEntry = {
  rank: number
  userId: string
  username: string
  xp: number
  level: number
  successRate: number | null
  submissionsCount: number
  completedQuizzes: number
  totalQuizzes: number
  progressPercent: number
  status: 'completed' | 'in_progress'
}

export type CourseSessionLeaderboardResponse = {
  courseId: string
  totalQuizzes: number
  leaderboard: CourseLeaderboardEntry[]
}

export const getCourses = async (userView: boolean = false) => {
  const params = userView ? '?userView=true' : ''
  return await apiFetch<CourseSummary[]>(`/courses${params}`)
}

export const getCourseById = async (uuid: string): Promise<CourseDetail> => {
  return await apiFetch<CourseDetail>(`/courses/${uuid}`)
}

export const getCourseDashboardAnalytics = async (
  uuid: string,
): Promise<CourseDashboardAnalytics> => {
  return await apiFetch<CourseDashboardAnalytics>(
    `/courses/${uuid}/dashboard-analytics`,
  )
}

export const updateCourse = async (
  courseId: string,
  body: CourseUpdateRequest,
): Promise<CourseSummary> => {
  return await apiFetch<CourseSummary>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const createCourse = async (
  body: CourseCreateRequest,
): Promise<CourseSummary> => {
  return await apiFetch<CourseSummary>('/courses', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const deleteCourse = async (courseId: string): Promise<void> => {
  return await apiFetch<void>(`/courses/${courseId}`, {
    method: 'DELETE',
  })
}

export const cloneCourse = async (courseId: string): Promise<CourseSummary> => {
  return await apiFetch(`/courses/${courseId}/clone`, {
    method: 'POST',
  })
}

export const getCourseShareLink = async (
  courseId: string,
): Promise<CourseShareLink> => {
  return await apiFetch<CourseShareLink>(`/courses/${courseId}/share-link`)
}

export const regenerateCourseShareLink = async (
  courseId: string,
): Promise<CourseShareLink> => {
  return await apiFetch<CourseShareLink>(
    `/courses/${courseId}/share-link/regenerate`,
    {
      method: 'POST',
    },
  )
}

export const resolveCourseShareToken = async (
  token: string,
): Promise<CourseShareResolve> => {
  return await apiFetch<CourseShareResolve>(`/course-share/${token}`)
}

export const getCourseSessionOverview = async (
  courseId: string,
): Promise<CourseSessionLeaderboardResponse> => {
  return await apiFetch<CourseSessionLeaderboardResponse>(
    `/courses/${courseId}/session/overview`,
  )
}

export const getCourseSessionLeaderboard = async (
  courseId: string,
): Promise<CourseSessionLeaderboardResponse> => {
  return await apiFetch<CourseSessionLeaderboardResponse>(
    `/courses/${courseId}/session/leaderboard`,
  )
}
