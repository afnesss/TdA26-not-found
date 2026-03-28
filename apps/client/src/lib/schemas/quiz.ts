import { z } from 'zod'

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
    message: 'Vyberte obtížnost kvízu',
  },
)

export const SingleChoiceQuestionSchema = z.object({
  uuid: z.string().uuid().optional(), // Optional on create
  type: z.literal('singleChoice'),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
})

export const MultipleChoiceQuestionSchema = z.object({
  uuid: z.string().uuid().optional(), // Optional on create
  type: z.literal('multipleChoice'),
  question: z.string(),
  options: z.array(z.string()),
  correctIndices: z.array(z.number().int()),
})

export const QuestionSchema = z.discriminatedUnion('type', [
  SingleChoiceQuestionSchema,
  MultipleChoiceQuestionSchema,
])

export const QuizSchema = z.object({
  uuid: z.string().uuid().optional(),
  title: z.string(),
  difficulty: QuizDifficultySchema.nullable().optional(),
  attemptsCount: z.number().int().optional(),
  averagePercentage: z.number().min(0).max(100).nullable().optional(),
  questions: z.array(QuestionSchema),
})

export const QuizAnswerSchema = z.object({
  uuid: z.string().uuid(),
  selectedIndex: z.number().int().optional(),
  selectedIndices: z.array(z.number().int()).optional(),
  // comment: z.string().optional(),
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
    .min(1, 'Otázka nesmí být prázdná')
    .refine((val) => val.trim().length > 0, {
      message: 'Otázka nesmí být prázdná',
    }),
  options: z
    .array(
      z
        .string()
        .min(1, 'Odpověď nesmí být prázdná')
        .refine((val) => val.trim().length > 0, {
          message: 'Odpověď nesmí být prázdná',
        }),
    )
    .min(1, 'Musí být alespoň jedna odpověď'),
  correctIndex: z.number().int().min(0),
})

export const MultipleChoiceQuestionValidationSchema = z.object({
  uuid: z.string().optional(),
  type: z.literal('multipleChoice'),
  question: z
    .string()
    .min(1, 'Otázka nesmí být prázdná')
    .refine((val) => val.trim().length > 0, {
      message: 'Otázka nesmí být prázdná',
    }),
  options: z
    .array(
      z
        .string()
        .min(1, 'Odpověď nesmí být prázdná')
        .refine((val) => val.trim().length > 0, {
          message: 'Odpověď nesmí být prázdná',
        }),
    )
    .min(1, 'Musí být alespoň jedna odpověď'),
  correctIndices: z
    .array(z.number().int())
    .min(1, 'Musí být alespoň jedna správná odpověď'),
})

export const QuestionValidationSchema = z.discriminatedUnion('type', [
  SingleChoiceQuestionValidationSchema,
  MultipleChoiceQuestionValidationSchema,
])

export const QuizValidationSchema = z.object({
  uuid: z.string().optional(),
  title: z
    .string()
    .min(1, 'Název kvízu nesmí být prázdný')
    .refine((val) => val.trim().length > 0, {
      message: 'Název kvízu nesmí být prázdný',
    }),
  difficulty: QuizDifficultyValidationSchema,
  attemptsCount: z.number().int().optional(),
  averagePercentage: z.number().min(0).max(100).nullable().optional(),
  questions: z
    .array(QuestionValidationSchema)
    .min(1, 'Musí být alespoň jedna otázka'),
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
