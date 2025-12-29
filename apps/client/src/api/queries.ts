import apiFetch from "./client"
import type { CourseSummary, CourseDetail, QuizSubmitResponse, QuizSubmitRequest } from "@/lib/schemas"


export const getCourses = async () =>
  await apiFetch<CourseSummary[]>("/courses")

export const getCourseById = async (uuid: string): Promise<CourseDetail | null> => {
  if (!uuid) return null;
  return await apiFetch<CourseDetail>(`/courses/${uuid}`);
}

export const submitQuiz = async (courseId: string, quizId: string, body: QuizSubmitRequest): Promise<QuizSubmitResponse | null> => {
  if (!courseId || !quizId) return null;
  return await apiFetch<QuizSubmitResponse>(`/courses/${courseId}/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

