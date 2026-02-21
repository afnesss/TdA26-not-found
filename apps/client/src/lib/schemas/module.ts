import { z } from 'zod'
import { MaterialSchema } from './material'
import { QuizSchema } from './quiz'

export const CourseModulesStatusSchema = z.enum(['active', 'passive'])

export const ModuleSummarySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: CourseModulesStatusSchema.default('passive'),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
})

export const ModuleDetailSchema = ModuleSummarySchema.extend({
  materials: z.array(MaterialSchema),
  quizzes: z.array(QuizSchema),
})

export const CourseModuleSchema = ModuleDetailSchema

export const ModuleCreateRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  status: CourseModulesStatusSchema.optional(),
})

export const ModuleUpdateRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: CourseModulesStatusSchema.optional(),
})

export const ModuleReorderRequestSchema = z.object({
  moduleIds: z
    .array(z.string().uuid())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'moduleIds obsahuje duplicity',
    }),
})
export type ModuleSummary = z.infer<typeof ModuleSummarySchema>
export type ModuleDetail = z.infer<typeof ModuleDetailSchema>
export type CourseModule = ModuleDetail
export type CourseModulesStatus = z.infer<typeof CourseModulesStatusSchema>
export type ModuleCreateRequest = z.infer<typeof ModuleCreateRequestSchema>
export type ModuleUpdateRequest = z.infer<typeof ModuleUpdateRequestSchema>
export type ModuleReorderRequest = z.infer<typeof ModuleReorderRequestSchema>
