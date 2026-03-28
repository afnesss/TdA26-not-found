import { z } from 'zod'
import { MaterialSchema } from './material'
import { QuizSchema } from './quiz'
import { QuizAnswerSchema } from './quiz'
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

export const CourseShareLinkSchema = z.object({
  shareUrl: z.string().url(),
})

export const CourseShareResolveSchema = z.object({
  courseId: z.string().uuid(),
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

export const CourseBackupFileSchema = z.object({
  materialUuid: z.string().uuid(),
  originalFilename: z.string(),
  mimeType: z.string().nullable().optional(),
  base64: z.string(),
})

export const CourseBackupSubmissionSchema = z.object({
  quizUuid: z.string().uuid(),
  score: z.number().int().nonnegative(),
  maxScore: z.number().int().positive(),
  answers: z.array(QuizAnswerSchema),
  createdAt: z.date().or(z.string().datetime()),
})

export const CourseBackupModuleSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(['active', 'passive']),
  position: z.number().int().positive(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
  materials: z.array(MaterialSchema),
  quizzes: z.array(
    QuizSchema.extend({
      uuid: z.string().uuid(),
      createdAt: z.date().or(z.string().datetime()),
      updatedAt: z.date().or(z.string().datetime()),
    }),
  ),
})

export const CourseBackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.date().or(z.string().datetime()),
  course: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
    status: CourseStatusSchema,
    createdAt: z.date().or(z.string().datetime()),
    updatedAt: z.date().or(z.string().datetime()),
    startedAt: z.date().or(z.string().datetime()).nullable().optional(),
    scheduledFor: z.date().or(z.string().datetime()).nullable().optional(),
    status_history: z.array(StatusHistoryEventSchema).optional(),
  }),
  modules: z.array(CourseBackupModuleSchema),
  feed: z.array(FeedItemSchema),
  quizSubmissions: z.array(CourseBackupSubmissionSchema),
  files: z.array(CourseBackupFileSchema),
  analyticsSnapshot: CourseDashboardAnalyticsSchema,
})

export const CoursesBackupCollectionSchema = z.object({
  version: z.literal(1),
  exportedAt: z.date().or(z.string().datetime()),
  scope: z.literal('all-courses'),
  courses: z.array(CourseBackupSchema),
})

export type CourseStatus = z.infer<typeof CourseStatusSchema>
export type CourseSummary = z.infer<typeof CourseSummarySchema>
export type CourseCreateRequest = z.infer<typeof CourseCreateRequestSchema>
export type CourseUpdateRequest = z.infer<typeof CourseUpdateRequestSchema>
export type CourseDetail = z.infer<typeof CourseDetailSchema>
export type CourseShareLink = z.infer<typeof CourseShareLinkSchema>
export type CourseShareResolve = z.infer<typeof CourseShareResolveSchema>
export type StatusHistoryEvent = z.infer<typeof StatusHistoryEventSchema>
export type DashboardModuleAnalytics = z.infer<
  typeof DashboardModuleAnalyticsSchema
>
export type CourseDashboardAnalytics = z.infer<
  typeof CourseDashboardAnalyticsSchema
>
export type CourseBackupFile = z.infer<typeof CourseBackupFileSchema>
export type CourseBackupSubmission = z.infer<
  typeof CourseBackupSubmissionSchema
>
export type CourseBackupModule = z.infer<typeof CourseBackupModuleSchema>
export type CourseBackup = z.infer<typeof CourseBackupSchema>
export type CoursesBackupCollection = z.infer<
  typeof CoursesBackupCollectionSchema
>
