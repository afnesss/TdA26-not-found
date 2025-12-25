import apiFetch from "./client"
import type { CoursesSummary, Course } from "@/lib/types"
import { CourseSummarySchema } from "@/lib/schemas"

export const getCourses = async () =>
  await apiFetch<CoursesSummary[]>("/courses")

export const getCourseById = async (uuid: string): Promise<Course | null> => {
  if (!uuid) return null;
  return await apiFetch<Course>(`/courses/${uuid}`);
}

