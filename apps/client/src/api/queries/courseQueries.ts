import type {
  CourseCreateRequest,
  CourseDashboardAnalytics,
  CourseDetail,
  CourseShareLink,
  CourseShareResolve,
  CourseSummary,
  CourseUpdateRequest,
} from '@/lib/schemas'
import { buildOrgApiPrefix } from '@/lib/routes'
import { buildLocaleHeaders } from '@/lib/i18n'
import i18n from '@/i18n'
import apiFetch from '../client'

const buildCourseApiPath = (orgSlug?: string, path: string = '/courses') =>
  `${buildOrgApiPrefix(orgSlug)}${path}`

export const getCourses = async (
  userView: boolean = false,
  orgSlug?: string,
) => {
  const params = userView ? '?userView=true' : ''
  return await apiFetch<CourseSummary[]>(buildCourseApiPath(orgSlug, `/courses${params}`))
}

export const getCourseById = async (
  uuid: string,
  orgSlug?: string,
): Promise<CourseDetail> => {
  return await apiFetch<CourseDetail>(buildCourseApiPath(orgSlug, `/courses/${uuid}`))
}

export const getCourseDashboardAnalytics = async (
  uuid: string,
  orgSlug?: string,
): Promise<CourseDashboardAnalytics> => {
  return await apiFetch<CourseDashboardAnalytics>(
    buildCourseApiPath(orgSlug, `/courses/${uuid}/dashboard-analytics`),
  )
}

export type CourseSessionOverview = {
  courseId: string
  totalQuizzes: number
  leaderboard: Array<{
    rank: number
    userId: string
    username: string
    successRate: number | null
    xp: number
    level: number
    completedQuizzes: number
    totalQuizzes: number
    submissionsCount: number
    status: 'completed' | 'in_progress'
    progressPercent: number
  }>
}

export const getCourseSessionOverview = async (
  courseId: string,
  orgSlug?: string,
): Promise<CourseSessionOverview> => {
  return await apiFetch<CourseSessionOverview>(
    buildCourseApiPath(orgSlug, `/courses/${courseId}/session/overview`),
  )
}

export const getCourseSessionLeaderboard = async (
  courseId: string,
  orgSlug?: string,
): Promise<CourseSessionOverview> => {
  return await apiFetch<CourseSessionOverview>(
    buildCourseApiPath(orgSlug, `/courses/${courseId}/session/leaderboard`),
  )
}

export const updateCourse = async (
  courseId: string,
  body: CourseUpdateRequest,
  orgSlug?: string,
): Promise<CourseSummary> => {
  return await apiFetch<CourseSummary>(buildCourseApiPath(orgSlug, `/courses/${courseId}`), {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const createCourse = async (
  body: CourseCreateRequest,
  orgSlug?: string,
): Promise<CourseSummary> => {
  return await apiFetch<CourseSummary>(buildCourseApiPath(orgSlug, '/courses'), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const deleteCourse = async (courseId: string, orgSlug?: string): Promise<void> => {
  return await apiFetch<void>(buildCourseApiPath(orgSlug, `/courses/${courseId}`), {
    method: 'DELETE',
  })
}

export const cloneCourse = async (
  courseId: string,
  orgSlug?: string,
): Promise<CourseSummary> => {
  return await apiFetch(buildCourseApiPath(orgSlug, `/courses/${courseId}/clone`), {
    method: 'POST',
  })
}

export const exportCourse = async (
  courseId: string,
  format: 'json' | 'csv',
  orgSlug?: string,
): Promise<Blob> => {
  const response = await fetch(
    `/api${buildCourseApiPath(orgSlug, `/courses/${courseId}/export`)}?format=${format}`,
    {
      credentials: 'include',
      headers: buildLocaleHeaders(),
    },
  )

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: i18n.t('errors.exportFailed', { ns: 'common' }) }))
    throw {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    }
  }

  return response.blob()
}

export const exportAllCourses = async (orgSlug?: string): Promise<Blob> => {
  const response = await fetch(`/api${buildCourseApiPath(orgSlug, '/courses/export-all')}`, {
    credentials: 'include',
    headers: buildLocaleHeaders(),
  })

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: i18n.t('errors.exportFailed', { ns: 'common' }) }))
    throw {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    }
  }

  return response.blob()
}

export const importCourseBackup = async (input: {
  file: File
  orgSlug?: string
}): Promise<CourseSummary[]> => {
  const formData = new FormData()
  formData.append('file', input.file)

  return await apiFetch<CourseSummary[]>(
    buildCourseApiPath(input.orgSlug, '/courses/import'),
    {
      method: 'POST',
      body: formData,
    },
  )
}

export const importAllCoursesBackup = async (input: {
  file: File
  orgSlug?: string
}): Promise<CourseSummary[]> => {
  const formData = new FormData()
  formData.append('file', input.file)

  return await apiFetch<CourseSummary[]>(
    buildCourseApiPath(input.orgSlug, '/courses/import'),
    {
      method: 'POST',
      body: formData,
    },
  )
}

export const getCourseShareLink = async (
  courseId: string,
  orgSlug?: string,
): Promise<CourseShareLink> => {
  return await apiFetch<CourseShareLink>(
    buildCourseApiPath(orgSlug, `/courses/${courseId}/share-link`),
  )
}

export const regenerateCourseShareLink = async (
  courseId: string,
  orgSlug?: string,
): Promise<CourseShareLink> => {
  return await apiFetch<CourseShareLink>(
    buildCourseApiPath(orgSlug, `/courses/${courseId}/share-link/regenerate`),
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
