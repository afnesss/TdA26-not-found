import type {
  CourseCreateRequest,
  CourseDetail,
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
