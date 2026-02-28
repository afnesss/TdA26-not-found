import { z } from 'zod'
import { MaterialSchema } from './material'
import { QuizSchema } from './quiz'
import { FeedItemSchema } from './feed'
import { CourseModuleSchema } from './module'

export const CourseStatusSchema = z.enum([
  'draft',
  'planned',
  'live',
  'paused',
  'archived',
])

export const StatusHistoryEventSchema = z.object({
  status: CourseStatusSchema,
  timestamp: z.date().or(z.string().datetime()),
  note: z.string().optional(),
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
  status_history: z.array(StatusHistoryEventSchema).optional(),
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
  startedAt: z.date().or(z.string().datetime()).nullable().optional(),
  scheduledFor: z.date().or(z.string().datetime()).nullable().optional(),
  status_history: z.array(StatusHistoryEventSchema).optional(),
})

export const CourseDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: CourseStatusSchema.default('draft'),
  modules: z.array(CourseModuleSchema),
  feed: z.array(FeedItemSchema),
  status_history: z.array(StatusHistoryEventSchema).optional(),
  startedAt: z.date().or(z.string().datetime()).nullable().optional(),
  scheduledFor: z.date().or(z.string().datetime()).nullable().optional(),
  createdAt: z.date().or(z.string().datetime()), // Date from DB, string from API
  updatedAt: z.date().or(z.string().datetime()),
})

export const DashboardModuleAnalyticsSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  status: z.enum(['active', 'passive']),
  materialsCount: z.number().int().nonnegative(),
  fileMaterialsCount: z.number().int().nonnegative(),
  urlMaterialsCount: z.number().int().nonnegative(),
  quizzesCount: z.number().int().nonnegative(),
  quizzesWithoutSubmits: z.number().int().nonnegative(),
  interactions: z.number().int().nonnegative(),
  downloadCount: z.number().int().nonnegative(),
  copyCount: z.number().int().nonnegative(),
  openCount: z.number().int().nonnegative(),
  quizAttempts: z.number().int().nonnegative(),
  averageQuizPercentage: z.number().min(0).max(100).nullable(),
  lowScoreQuizzes: z.number().int().nonnegative(),
})

export const CourseDashboardAnalyticsSchema = z.object({
  courseId: z.string().uuid(),
  modulesCount: z.number().int().nonnegative(),
  materialsCount: z.number().int().nonnegative(),
  quizzesCount: z.number().int().nonnegative(),
  quizzesWithoutSubmits: z.number().int().nonnegative(),
  interactions: z.number().int().nonnegative(),
  downloadCount: z.number().int().nonnegative(),
  copyCount: z.number().int().nonnegative(),
  openCount: z.number().int().nonnegative(),
  averageQuizPercentage: z.number().min(0).max(100).nullable(),
  modulesWithoutInteraction: z.number().int().nonnegative(),
  lowScoreQuizzes: z.number().int().nonnegative(),
  modules: z.array(DashboardModuleAnalyticsSchema),
})

export type CourseStatus = z.infer<typeof CourseStatusSchema>
export type CourseSummary = z.infer<typeof CourseSummarySchema>
export type CourseCreateRequest = z.infer<typeof CourseCreateRequestSchema>
export type CourseUpdateRequest = z.infer<typeof CourseUpdateRequestSchema>
export type CourseDetail = z.infer<typeof CourseDetailSchema>
export type StatusHistoryEvent = z.infer<typeof StatusHistoryEventSchema>
export type DashboardModuleAnalytics = z.infer<
  typeof DashboardModuleAnalyticsSchema
>
export type CourseDashboardAnalytics = z.infer<
  typeof CourseDashboardAnalyticsSchema
>
