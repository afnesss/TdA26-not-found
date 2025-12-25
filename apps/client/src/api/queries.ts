import apiFetch from "./client"
import type { Courses } from "@/lib/constants"

export const getCourses = async () =>
  await apiFetch<Courses[]>("/courses")

