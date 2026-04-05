import commonCs from './cs/common'
import headerCs from './cs/header'
import homepageCs from './cs/homepage'
import commonEn from './en/common'
import headerEn from './en/header'
import homepageEn from './en/homepage'

export const resources = {
  en: {
    common: commonEn,
    header: headerEn,
    homepage: homepageEn,
  },
  cs: {
    common: commonCs,
    header: headerCs,
    homepage: homepageCs,
  },
} as const

export type TranslationResources = typeof resources
