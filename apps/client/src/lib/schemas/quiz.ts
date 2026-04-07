import i18n from '@/i18n'
import { z } from 'zod'
import {
  LocaleSchema,
  LocalizedEntityMetaSchema,
  LocalizedFieldSchema,
  LocalizedQuestionSchema,
} from './i18n'

const quizDifficultyRequiredMessage = i18n.t(
  'validation.quizDifficultyRequired',
  { ns: 'common' },
)
const quizQuestionRequiredMessage = i18n.t(
  'validation.quizQuestionRequired',
  { ns: 'common' },
)
const quizAnswerRequiredMessage = i18n.t('validation.quizAnswerRequired', {
  ns: 'common',
})
const quizAtLeastOneAnswerMessage = i18n.t(
  'validation.quizAtLeastOneAnswer',
  { ns: 'common' },
)
const quizAtLeastOneCorrectAnswerMessage = i18n.t(
  'validation.quizAtLeastOneCorrectAnswer',
  { ns: 'common' },
)
const quizTitleRequiredMessage = i18n.t('validation.quizTitleRequired', {
  ns: 'common',
})
const quizAtLeastOneQuestionMessage = i18n.t(
  'validation.quizAtLeastOneQuestion',
  { ns: 'common' },
)

export const QuizDifficultySchema = z.enum([
  'beginner',
  'easy',
  'medium',
  'hard',
  'extreme',
])

const QuizDifficultyValidationSchema = z.enum(
  ['beginner', 'easy', 'medium', 'hard', 'extreme'],
  {
    message: quizDifficultyRequiredMessage,
  },
)

export const SingleChoiceQuestionSchema = z.object({
  uuid: z.string().uuid().optional(),
  type: z.literal('singleChoice'),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
})

export const MultipleChoiceQuestionSchema = z.object({
  uuid: z.string().uuid().optional(),
  type: z.literal('multipleChoice'),
  question: z.string(),
  options: z.array(z.string()),
  correctIndices: z.array(z.number().int()),
})

export const QuestionSchema = z.discriminatedUnion('type', [
  SingleChoiceQuestionSchema,
  MultipleChoiceQuestionSchema,
])

export const QuizSchema = z
  .object({
    uuid: z.string().uuid().optional(),
    title: z.string(),
    titleI18n: LocalizedFieldSchema.optional(),
    questionsI18n: z.array(LocalizedQuestionSchema).optional(),
    resolvedLocale: LocaleSchema.optional(),
    isFallback: z.boolean().optional(),
    difficulty: QuizDifficultySchema.default('beginner'),
    attemptsCount: z.number().int().optional(),
    averagePercentage: z.number().min(0).max(100).nullable().optional(),
    questions: z.array(QuestionSchema),
  })
  .merge(LocalizedEntityMetaSchema)

export const QuizAnswerSchema = z.object({
  uuid: z.string().uuid(),
  selectedIndex: z.number().int().optional(),
  selectedIndices: z.array(z.number().int()).optional(),
})

export const QuizSubmitRequestSchema = z.object({
  answers: z.array(QuizAnswerSchema),
})

export const QuizSubmitResponseSchema = z.object({
  quizUuid: z.string().uuid(),
  score: z.number(),
  maxScore: z.number(),
  correctPerQuestion: z.array(z.boolean()),
  submittedAt: z.string().datetime(),
  participantXp: z.number().int().nullable().optional(),
  participantLevel: z.number().int().nullable().optional(),
})

export const QuizResultsSchema = z.record(
  z.string(),
  z.object({
    submitted: z.boolean(),
    answers: z.record(
      z.string(),
      z.object({
        correctAnswer: z.union([z.number(), z.array(z.number())]),
      }),
    ),
  }),
)

export const SingleChoiceQuestionValidationSchema = z.object({
  uuid: z.string().optional(),
  type: z.literal('singleChoice'),
  question: z
    .string()
    .min(1, quizQuestionRequiredMessage)
    .refine((val) => val.trim().length > 0, {
      message: quizQuestionRequiredMessage,
    }),
  options: z
    .array(
      z
        .string()
        .min(1, quizAnswerRequiredMessage)
        .refine((val) => val.trim().length > 0, {
          message: quizAnswerRequiredMessage,
        }),
    )
    .min(1, quizAtLeastOneAnswerMessage),
  correctIndex: z.number().int().min(0),
})

export const MultipleChoiceQuestionValidationSchema = z.object({
  uuid: z.string().optional(),
  type: z.literal('multipleChoice'),
  question: z
    .string()
    .min(1, quizQuestionRequiredMessage)
    .refine((val) => val.trim().length > 0, {
      message: quizQuestionRequiredMessage,
    }),
  options: z
    .array(
      z
        .string()
        .min(1, quizAnswerRequiredMessage)
        .refine((val) => val.trim().length > 0, {
          message: quizAnswerRequiredMessage,
        }),
    )
    .min(1, quizAtLeastOneAnswerMessage),
  correctIndices: z
    .array(z.number().int())
    .min(1, quizAtLeastOneCorrectAnswerMessage),
})

export const QuestionValidationSchema = z.discriminatedUnion('type', [
  SingleChoiceQuestionValidationSchema,
  MultipleChoiceQuestionValidationSchema,
])

export const QuizValidationSchema = z.object({
  uuid: z.string().optional(),
  title: z
    .string()
    .min(1, quizTitleRequiredMessage)
    .refine((val) => val.trim().length > 0, {
      message: quizTitleRequiredMessage,
    }),
  difficulty: QuizDifficultyValidationSchema.default('beginner'),
  attemptsCount: z.number().int().optional(),
  averagePercentage: z.number().min(0).max(100).nullable().optional(),
  questions: z
    .array(QuestionValidationSchema)
    .min(1, quizAtLeastOneQuestionMessage),
})

export const QuestionAnalyticsSchema = z.object({
  uuid: z.string(),
  correctAnswers: z.number().min(0),
  correctRate: z.number().min(0).max(100),
  options: z.array(
    z.object({
      index: z.number(),
      selectedCount: z.number().min(0),
    }),
  ),
})

export const QuizAnalyticsResponseSchema = z.object({
  uuid: z.string(),
  averagePercentage: z.number().min(0),
  questionAnalytics: z.array(QuestionAnalyticsSchema),
})

export type SingleChoiceQuestion = z.infer<typeof SingleChoiceQuestionSchema>
export type MultipleChoiceQuestion = z.infer<
  typeof MultipleChoiceQuestionSchema
>
export type Question = z.infer<typeof QuestionSchema>
export type Quiz = z.infer<typeof QuizSchema>
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>
export type QuizSubmitRequest = z.infer<typeof QuizSubmitRequestSchema>
export type QuizSubmitResponse = z.infer<typeof QuizSubmitResponseSchema>
export type QuizResults = z.infer<typeof QuizResultsSchema>
export type QuizAnalyticsResponse = z.infer<typeof QuizAnalyticsResponseSchema>
export type QuestionAnalytics = z.infer<typeof QuestionAnalyticsSchema>
