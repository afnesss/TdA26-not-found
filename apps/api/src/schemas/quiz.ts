import { z } from "zod";

export const QuizDifficultySchema = z.enum([
  "beginner",
  "easy",
  "medium",
  "hard",
  "extreme",
]);

export const SingleChoiceQuestionSchema = z.object({
  uuid: z.string().uuid().optional(), // Optional on create
  type: z.literal("singleChoice"),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
});

export const MultipleChoiceQuestionSchema = z.object({
  uuid: z.string().uuid().optional(), // Optional on create
  type: z.literal("multipleChoice"),
  question: z.string(),
  options: z.array(z.string()),
  correctIndices: z.array(z.number().int()),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  SingleChoiceQuestionSchema,
  MultipleChoiceQuestionSchema,
]);

export const QuizSchema = z.object({
  uuid: z.string().uuid().optional(),
  title: z.string(),
  difficulty: QuizDifficultySchema.default("beginner"),
  attemptsCount: z.number().int().optional(),
  averagePercentage: z.number().min(0).max(100).nullable().optional(),
  questions: z.array(QuestionSchema),
});

export const QuizAnswerSchema = z.object({
  uuid: z.string().uuid(),
  selectedIndex: z.number().int().optional(),
  selectedIndices: z.array(z.number().int()).optional(),
  // comment: z.string().optional(),
});

export const QuizSubmitRequestSchema = z.object({
  answers: z.array(QuizAnswerSchema),
});

export const QuizSubmitResponseSchema = z.object({
  quizUuid: z.string().uuid(),
  score: z.number(),
  maxScore: z.number(),
  correctPerQuestion: z.array(z.boolean()),
  submittedAt: z.string().datetime(),
  participantXp: z.number().int().nullable().optional(),
  participantLevel: z.number().int().nullable().optional(),
});

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
});

export const QuizAnalyticsResponseSchema = z.object({
  uuid: z.string(),
  averagePercentage: z.number().min(0),
  questionAnalytics: z.array(QuestionAnalyticsSchema),
});

export type SingleChoiceQuestion = z.infer<typeof SingleChoiceQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<
  typeof MultipleChoiceQuestionSchema
>;
export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
export type QuizSubmitRequest = z.infer<typeof QuizSubmitRequestSchema>;
export type QuizSubmitResponse = z.infer<typeof QuizSubmitResponseSchema>;
export type QuizAnalyticsResponse = z.infer<typeof QuizAnalyticsResponseSchema>;
export type QuestionAnalytics = z.infer<typeof QuestionAnalyticsSchema>;
