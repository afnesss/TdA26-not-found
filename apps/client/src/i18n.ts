import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './locales'
import { DEFAULT_UI_LOCALE, getStoredUiLocale } from './lib/i18n'

void i18n.use(initReactI18next).init({
  resources,
  lng: getStoredUiLocale(),
  fallbackLng: DEFAULT_UI_LOCALE,
  supportedLngs: ['en', 'cs'],
  defaultNS: 'common',
  ns: [
    'admin',
    'common',
    'footer',
    'header',
    'homepage',
    'legal',
    'login',
    'shop',
    'organizationInfo',
    'organizationRequest',
    'organizationRequestStatus',
  ],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})

export default i18n
