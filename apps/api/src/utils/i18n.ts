import type { Request } from "express";
import type { Locale, LocalizedField, LocalizedQuestion } from "../schemas/i18n";

export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES = ["cs", "en"] as const;

type RequestWithLocale = Request & { locale?: Locale };

export const isLocale = (value: unknown): value is Locale =>
  value === "cs" || value === "en";

export const normalizeLocale = (value: unknown): Locale =>
  isLocale(value) ? value : DEFAULT_LOCALE;

export const normalizeContentLocale = (value: unknown): Locale =>
  value === "cs" ? "cs" : "en";

export const getRequestLocale = (req: Request): Locale =>
  normalizeLocale(
    (req as RequestWithLocale).locale ??
      req.header("x-locale") ??
      req.query.locale,
  );

export const compactLocalizedField = (
  field?: LocalizedField | null,
): LocalizedField => {
  const next: LocalizedField = {};

  if (field?.cs?.trim()) next.cs = field.cs.trim();
  if (field?.en?.trim()) next.en = field.en.trim();

  return next;
};

export const buildLocalizedField = (
  sourceLocale: string,
  value?: string | null,
  existing?: LocalizedField | null,
): LocalizedField => {
  const next = compactLocalizedField(existing);
  const normalizedSourceLocale = normalizeContentLocale(sourceLocale);

  if (typeof value === "string" && value.trim()) {
    next[normalizedSourceLocale] = value.trim();
  }

  return next;
};

export const resolveLocalizedField = (
  field: LocalizedField | null | undefined,
  sourceLocale: string,
  requestedLocale: Locale,
  fallbackPlain?: string | null,
): string | undefined => {
  const localized = compactLocalizedField(field);
  const normalizedSourceLocale = normalizeContentLocale(sourceLocale);
  const resolved =
    localized[requestedLocale] ??
    localized.en ??
    localized[normalizedSourceLocale] ??
    localized.cs ??
    fallbackPlain ??
    undefined;

  return typeof resolved === "string" && resolved.length > 0
    ? resolved
    : undefined;
};

export const buildLocalizedQuestions = (
  sourceLocale: string,
  questions: Array<{
    uuid?: string;
    type: "singleChoice" | "multipleChoice";
    question: string;
    options: string[];
    correctIndex?: number;
    correctIndices?: number[];
  }>,
): LocalizedQuestion[] =>
  questions.map((question) => ({
    uuid: question.uuid,
    type: question.type,
    questionI18n: buildLocalizedField(sourceLocale, question.question),
    optionsI18n: question.options.map((option) =>
      buildLocalizedField(sourceLocale, option),
    ),
    ...(typeof question.correctIndex === "number"
      ? { correctIndex: question.correctIndex }
      : {}),
    ...(Array.isArray(question.correctIndices)
      ? { correctIndices: question.correctIndices }
      : {}),
  }));

export const resolveLocalizedQuestions = (
  questionsI18n: LocalizedQuestion[] | null | undefined,
  sourceLocale: string,
  requestedLocale: Locale,
  fallbackQuestions?: Array<{
    uuid?: string;
    type: "singleChoice" | "multipleChoice";
    question: string;
    options: string[];
    correctIndex?: number;
    correctIndices?: number[];
  }>,
) => {
  if (Array.isArray(questionsI18n) && questionsI18n.length > 0) {
    return questionsI18n.map((question, index) => ({
      uuid: question.uuid,
      type: question.type,
      question:
        resolveLocalizedField(
          question.questionI18n,
          sourceLocale,
          requestedLocale,
          fallbackQuestions?.[index]?.question,
        ) ?? "",
      options: question.optionsI18n.map(
        (option, optionIndex) =>
          resolveLocalizedField(
            option,
            sourceLocale,
            requestedLocale,
            fallbackQuestions?.[index]?.options?.[optionIndex],
          ) ?? "",
      ),
      ...(typeof question.correctIndex === "number"
        ? { correctIndex: question.correctIndex }
        : {}),
      ...(Array.isArray(question.correctIndices)
        ? { correctIndices: question.correctIndices }
        : {}),
    }));
  }

  return fallbackQuestions ?? [];
};
