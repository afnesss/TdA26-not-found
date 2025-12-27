import apiFetch from "./client"
import type { CourseSummary, CourseDetail } from "@/lib/schemas"

export const getCourses = async () =>
  await apiFetch<CourseSummary[]>("/courses")

export const getCourseById = async (uuid: string): Promise<CourseDetail | null> => {
  if (!uuid) return null;
  return await apiFetch<CourseDetail>(`/courses/${uuid}`);
}

