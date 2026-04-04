import type { LocalizedField, LocalizedQuestion, Locale } from "../schemas";
import {
  buildLocalizedField,
  buildLocalizedQuestions,
  resolveLocalizedField,
  resolveLocalizedQuestions,
} from "./i18n";

type LocalizedTextEntity = {
  sourceLocale?: string | null;
  name?: string | null;
  nameI18n?: LocalizedField | null;
  description?: string | null;
  descriptionI18n?: LocalizedField | null;
  title?: string | null;
  titleI18n?: LocalizedField | null;
  message?: string | null;
  messageI18n?: LocalizedField | null;
  questions?: unknown;
  questionsI18n?: LocalizedQuestion[] | null;
};

const getSourceLocale = (entity: LocalizedTextEntity) =>
  entity.sourceLocale ?? "en";

export const localizeNameDescription = <
  T extends LocalizedTextEntity & Record<string, unknown>,
>(
  entity: T,
  locale: Locale,
) => {
  const sourceLocale = getSourceLocale(entity);
  const name = resolveLocalizedField(
    entity.nameI18n,
    sourceLocale,
    locale,
    entity.name,
  );
  const description = resolveLocalizedField(
    entity.descriptionI18n,
    sourceLocale,
    locale,
    entity.description,
  );

  return {
    ...entity,
    sourceLocale,
    name: name ?? entity.name ?? "",
    nameI18n: buildLocalizedField(sourceLocale, entity.name, entity.nameI18n),
    description: description ?? entity.description ?? undefined,
    descriptionI18n: buildLocalizedField(
      sourceLocale,
      entity.description,
      entity.descriptionI18n,
    ),
    resolvedLocale: locale,
    isFallback: Boolean(
      (locale === "en" && !entity.nameI18n?.en && entity.nameI18n?.cs) ||
        (locale === "cs" && !entity.nameI18n?.cs && entity.nameI18n?.en),
    ),
  };
};

export const localizeTitleQuestions = <
  T extends LocalizedTextEntity & Record<string, unknown>,
>(
  entity: T,
  locale: Locale,
) => {
  const sourceLocale = getSourceLocale(entity);
  const fallbackQuestions = Array.isArray(entity.questions)
    ? (entity.questions as Array<{
        uuid?: string;
        type: "singleChoice" | "multipleChoice";
        question: string;
        options: string[];
        correctIndex?: number;
        correctIndices?: number[];
      }>)
    : [];
  const title = resolveLocalizedField(
    entity.titleI18n,
    sourceLocale,
    locale,
    entity.title,
  );

  return {
    ...entity,
    sourceLocale,
    title: title ?? entity.title ?? "",
    titleI18n: buildLocalizedField(sourceLocale, entity.title, entity.titleI18n),
    questions: resolveLocalizedQuestions(
      entity.questionsI18n,
      sourceLocale,
      locale,
      fallbackQuestions,
    ),
    questionsI18n:
      entity.questionsI18n && entity.questionsI18n.length > 0
        ? entity.questionsI18n
        : buildLocalizedQuestions(sourceLocale, fallbackQuestions),
    resolvedLocale: locale,
    isFallback: Boolean(
      (locale === "en" && !entity.titleI18n?.en && entity.titleI18n?.cs) ||
        (locale === "cs" && !entity.titleI18n?.cs && entity.titleI18n?.en),
    ),
  };
};

export const localizeMessage = <
  T extends LocalizedTextEntity & Record<string, unknown>,
>(
  entity: T,
  locale: Locale,
) => {
  const sourceLocale = getSourceLocale(entity);
  const message = resolveLocalizedField(
    entity.messageI18n,
    sourceLocale,
    locale,
    entity.message,
  );

  return {
    ...entity,
    sourceLocale,
    message: message ?? entity.message ?? "",
    messageI18n: buildLocalizedField(
      sourceLocale,
      entity.message,
      entity.messageI18n,
    ),
    resolvedLocale: locale,
    isFallback: Boolean(
      (locale === "en" && !entity.messageI18n?.en && entity.messageI18n?.cs) ||
        (locale === "cs" &&
          !entity.messageI18n?.cs &&
          entity.messageI18n?.en),
    ),
  };
};
