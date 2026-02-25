import { z } from "zod";
import { FeedItemSchema } from "./feed";
import { CourseModuleSchema } from "./module";

export const CourseStatusSchema = z.enum([
  "draft",
  "planned",
  "live",
  "paused",
  "archived",
]);

export const StatusHistoryEventSchema = z.object({
  status: CourseStatusSchema,
  timestamp: z.date().or(z.string().datetime()),
  note: z.string().optional(),
});

export const CourseSummarySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(), // Nullable from DB
  status: CourseStatusSchema.default("draft"),
  createdAt: z.date().or(z.string().datetime()), // Date from DB, string from API
  updatedAt: z.date().or(z.string().datetime()),

  startedAt: z.date().or(z.string().datetime()).nullable().optional(),
  scheduledFor: z.date().or(z.string().datetime()).nullable().optional(),
  status_history: z.array(StatusHistoryEventSchema).optional(),
});

export const CourseCreateRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const CourseUpdateRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: CourseStatusSchema.optional(),
  scheduledFor: z.date().or(z.string().datetime()).nullable().optional(),
});

export const CourseDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: CourseStatusSchema.default("draft"),
  modules: z.array(CourseModuleSchema),
  feed: z.array(FeedItemSchema),
  status_history: z.array(StatusHistoryEventSchema).optional(),
  createdAt: z.date().or(z.string().datetime()), // Date from DB, string from API
  updatedAt: z.date().or(z.string().datetime()).optional(),
});

export type CourseSummary = z.infer<typeof CourseSummarySchema>;
export type CourseCreateRequest = z.infer<typeof CourseCreateRequestSchema>;
export type CourseUpdateRequest = z.infer<typeof CourseUpdateRequestSchema>;
export type CourseDetail = z.infer<typeof CourseDetailSchema>;
export type StatusHistoryEvent = z.infer<typeof StatusHistoryEventSchema>;
