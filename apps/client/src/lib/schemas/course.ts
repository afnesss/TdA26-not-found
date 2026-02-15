import { z } from 'zod'
import { MaterialSchema } from './material'
import { QuizSchema } from './quiz'
import { FeedItemSchema } from './feed'

export const CourseStatusSchema = z.enum([
  'draft',
  'planned',
  'live',
  'paused',
  'archived',
])

export const StatusHistoryEventSchema = z.object({
  statuts: CourseStatusSchema,
  timestamp: z.date().or(z.string().datetime()),
  note: z.string().optional(),
})

export const StatusHistorySchema = z.object({
  events: z.array(StatusHistoryEventSchema),
})

export const CourseSummarySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(), // Nullable from DB
  status: CourseStatusSchema.default('draft'),
  createdAt: z.date().or(z.string().datetime()), // Date from DB, string from API
  updatedAt: z.date().or(z.string().datetime()),

  startedAt: z.date().or(z.string().datetime()).nullable().optional(),
  scheduledFor: z.date().or(z.string().datetime()).nullable().optional(),
  status_history: StatusHistorySchema.optional(),
})

export const CourseCreateRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const CourseUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'Název kurzu nesmí být prázdný')
    .refine((val) => val.trim().length > 0, {
      message: 'Název kurzu nesmí být prázdný',
    })
    .optional(),
  description: z.string().optional(),
  status: CourseStatusSchema.optional(),
})

export const CourseDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: CourseStatusSchema.default('draft'),
  materials: z.array(MaterialSchema),
  quizzes: z.array(QuizSchema),
  feed: z.array(FeedItemSchema),
})

export type CourseStatus = z.infer<typeof CourseStatusSchema>
export type CourseSummary = z.infer<typeof CourseSummarySchema>
export type CourseCreateRequest = z.infer<typeof CourseCreateRequestSchema>
export type CourseUpdateRequest = z.infer<typeof CourseUpdateRequestSchema>
export type CourseDetail = z.infer<typeof CourseDetailSchema>
