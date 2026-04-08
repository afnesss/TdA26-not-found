import i18n from '@/i18n'
import type { CourseSummary } from '@/lib/schemas'

type UiLocale = 'cs' | 'en'

const resolveLocalizedText = (
  locale: UiLocale,
  field?: { cs?: string; en?: string },
  fallback?: string | null,
) => field?.[locale] ?? field?.en ?? field?.cs ?? fallback ?? undefined

export const getCurrentUiLocale = (): UiLocale =>
  i18n.resolvedLanguage === 'cs' ? 'cs' : 'en'

export const localizeCourseForUi = (
  course: CourseSummary,
  locale: UiLocale = getCurrentUiLocale(),
): CourseSummary => ({
  ...course,
  name: resolveLocalizedText(locale, course.nameI18n, course.name) ?? course.name,
  description:
    resolveLocalizedText(
      locale,
      course.descriptionI18n,
      course.description ?? undefined,
    ) ?? course.description,
})

export const localizeCoursesForUi = (
  courses: CourseSummary[],
  locale: UiLocale = getCurrentUiLocale(),
) => courses.map((course) => localizeCourseForUi(course, locale))
