import apiFetch from "./client"
import type { CourseSummary, CourseDetail, QuizSubmitResponse, QuizSubmitRequest, Material, Quiz, FeedItem } from "@/lib/schemas"


export const getCourses = async () =>
  await apiFetch<CourseSummary[]>("/courses")

export const getCourseById = async (uuid: string): Promise<CourseDetail | null> => {
  return await apiFetch<CourseDetail>(`/courses/${uuid}`);
}

export const submitQuiz = async (courseId: string, quizId: string, body: QuizSubmitRequest): Promise<QuizSubmitResponse | null> => {
  return await apiFetch<QuizSubmitResponse>(`/courses/${courseId}/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}


export const getMaterialsForCourse = async (courseId: string): Promise<Material[] | null> => {
  return await apiFetch<Material[]>(`/courses/${courseId}/materials`);
}

export const getQuizzesForCourse = async (courseId: string): Promise<Quiz[] | null> => {
  return await apiFetch<Quiz[]>(`/courses/${courseId}/quizzes`);
}

export const getFeedForCourse = async (courseId: string): Promise<FeedItem[] | null> => {
  return await apiFetch<FeedItem[]>(`/courses/${courseId}/feed`);
}
