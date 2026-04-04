import type { Locale } from './schemas/i18n'

export const DEFAULT_UI_LOCALE: Locale = 'en'
export const UI_LOCALE_STORAGE_KEY = 'tda-ui-locale'

export const isLocale = (value: unknown): value is Locale =>
  value === 'cs' || value === 'en'

export const getStoredUiLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_UI_LOCALE

  const value = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY)
  return isLocale(value) ? value : DEFAULT_UI_LOCALE
}

export const setStoredUiLocale = (locale: Locale) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale)
}

export const buildLocaleHeaders = (): HeadersInit => ({
  'X-Locale': getStoredUiLocale(),
})

export const appendLocaleQuery = (path: string) => {
  const locale = getStoredUiLocale()
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}locale=${encodeURIComponent(locale)}`
}
