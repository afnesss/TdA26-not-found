import { z } from "zod";

export const LocaleSchema = z.enum(["cs", "en"]);

export const LocalizedFieldSchema = z.object({
  cs: z.string().optional(),
  en: z.string().optional(),
});

export const LocalizedEntityMetaSchema = z.object({
  sourceLocale: LocaleSchema.optional(),
});

export const LocalizedQuestionSchema = z.object({
  uuid: z.string().uuid().optional(),
  type: z.enum(["singleChoice", "multipleChoice"]),
  questionI18n: LocalizedFieldSchema,
  optionsI18n: z.array(LocalizedFieldSchema),
  correctIndex: z.number().int().optional(),
  correctIndices: z.array(z.number().int()).optional(),
});

export type Locale = z.infer<typeof LocaleSchema>;
export type UiLocale = Locale;
export type ContentLocale = Locale;
export type LocalizedField = z.infer<typeof LocalizedFieldSchema>;
export type LocalizedEntityMeta = z.infer<typeof LocalizedEntityMetaSchema>;
export type LocalizedQuestion = z.infer<typeof LocalizedQuestionSchema>;
