import i18n from '@/i18n'
import { z } from 'zod'
import {
  LocaleSchema,
  LocalizedEntityMetaSchema,
  LocalizedFieldSchema,
} from './i18n'
import { MaterialSchema } from './material'
import { QuizSchema } from './quiz'

const moduleIdsDuplicateMessage = i18n.t('validation.moduleIdsDuplicate', {
  ns: 'common',
})

export const CourseModulesStatusSchema = z.enum(['active', 'passive'])

export const ModuleSummarySchema = z
  .object({
    uuid: z.string().uuid(),
    name: z.string(),
    nameI18n: LocalizedFieldSchema.optional(),
    description: z.string().optional().nullable(),
    descriptionI18n: LocalizedFieldSchema.optional(),
    resolvedLocale: LocaleSchema.optional(),
    isFallback: z.boolean().optional(),
    status: CourseModulesStatusSchema.default('passive'),
    createdAt: z.date().or(z.string().datetime()),
    updatedAt: z.date().or(z.string().datetime()),
  })
  .merge(LocalizedEntityMetaSchema)

export const ModuleDetailSchema = ModuleSummarySchema.extend({
  materials: z.array(MaterialSchema),
  quizzes: z.array(QuizSchema),
})

export const CourseModuleSchema = ModuleDetailSchema

export const ModuleCreateRequestSchema = z.object({
  sourceLocale: LocaleSchema.default('en'),
  name: z.string().min(1),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional().nullable(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  status: CourseModulesStatusSchema.optional(),
})

export const ModuleUpdateRequestSchema = z.object({
  sourceLocale: LocaleSchema.optional(),
  name: z.string().min(1).optional(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional().nullable(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  status: CourseModulesStatusSchema.optional(),
})

export const ModuleReorderRequestSchema = z.object({
  moduleIds: z
    .array(z.string().uuid())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: moduleIdsDuplicateMessage,
    }),
})

export type ModuleSummary = z.infer<typeof ModuleSummarySchema>
export type ModuleDetail = z.infer<typeof ModuleDetailSchema>
export type CourseModule = ModuleDetail
export type CourseModulesStatus = z.infer<typeof CourseModulesStatusSchema>
export type ModuleCreateRequest = z.infer<typeof ModuleCreateRequestSchema>
export type ModuleUpdateRequest = z.infer<typeof ModuleUpdateRequestSchema>
export type ModuleReorderRequest = z.infer<typeof ModuleReorderRequestSchema>
