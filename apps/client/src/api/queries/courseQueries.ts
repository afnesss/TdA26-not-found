import type {
  CourseCreateRequest,
  CourseDetail,
  CourseSummary,
  CourseUpdateRequest,
} from '@/lib/schemas'
import apiFetch from '../client'

export const getCourses = async () =>
  await apiFetch<CourseSummary[]>('/courses')

export const getCourseById = async (
  uuid: string,
): Promise<CourseDetail | null> => {
  return await apiFetch<CourseDetail>(`/courses/${uuid}`)
}

export const updateCourse = async (
  courseId: string,
  body: CourseUpdateRequest,
): Promise<CourseSummary | null> => {
  return await apiFetch<CourseSummary>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const createCourse = async (
  body: CourseCreateRequest,
): Promise<CourseSummary | null> => {
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
