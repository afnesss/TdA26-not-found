import { z } from "zod";
import { MaterialSchema } from "./material";
import { QuizSchema } from "./quiz";
import { FeedItemSchema } from "./feed";

export const CourseSummarySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(), // Nullable from DB
  createdAt: z.date().or(z.string().datetime()), // Date from DB, string from API
  updatedAt: z.date().or(z.string().datetime()),
});

export const CourseCreateRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const CourseUpdateRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const CourseDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  materials: z.array(MaterialSchema),
  quizzes: z.array(QuizSchema),
  feed: z.array(FeedItemSchema),
});

export type CourseSummary = z.infer<typeof CourseSummarySchema>;
export type CourseCreateRequest = z.infer<typeof CourseCreateRequestSchema>;
export type CourseUpdateRequest = z.infer<typeof CourseUpdateRequestSchema>;
export type CourseDetail = z.infer<typeof CourseDetailSchema>;
