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

export const exportCourse = async (
  courseId: string,
  format: 'json' | 'csv',
): Promise<Blob> => {
  const response = await fetch(
    `/api/courses/${courseId}/export?format=${format}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: 'Export selhal' }))
    throw {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    }
  }

  return response.blob()
}

export const exportAllCourses = async (): Promise<Blob> => {
  const response = await fetch('/api/courses/export-all', {
    credentials: 'include',
  })

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: 'Export selhal' }))
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
}): Promise<CourseSummary[]> => {
  const formData = new FormData()
  formData.append('file', input.file)

  return await apiFetch<CourseSummary[]>('/courses/import', {
    method: 'POST',
    body: formData,
  })
}

export const importAllCoursesBackup = async (input: {
  file: File
}): Promise<CourseSummary[]> => {
  const formData = new FormData()
  formData.append('file', input.file)

  return await apiFetch<CourseSummary[]>('/courses/import', {
    method: 'POST',
    body: formData,
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
