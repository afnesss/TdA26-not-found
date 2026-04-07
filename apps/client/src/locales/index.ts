import adminCs from './cs/admin'
import commonCs from './cs/common'
import coursesCs from './cs/courses'
import dashboardCs from './cs/dashboard'
import footerCs from './cs/footer'
import headerCs from './cs/header'
import homepageCs from './cs/homepage'
import legalCs from './cs/legal'
import loginCs from './cs/login'
import shopCs from './cs/shop'
import organizationRequestCs from './cs/organizationRequest'
import organizationRequestStatusCs from './cs/organizationRequestStatus'
import organizationInfoCs from './cs/organizationInfo'
import adminEn from './en/admin'
import commonEn from './en/common'
import coursesEn from './en/courses'
import dashboardEn from './en/dashboard'
import footerEn from './en/footer'
import headerEn from './en/header'
import homepageEn from './en/homepage'
import legalEn from './en/legal'
import loginEn from './en/login'
import shopEn from './en/shop'
import organizationRequestEn from './en/organizationRequest'
import organizationRequestStatusEn from './en/organizationRequestStatus'
import organizationInfoEn from './en/organizationInfo'

export const resources = {
  en: {
    admin: adminEn,
    common: commonEn,
    courses: coursesEn,
    dashboard: dashboardEn,
    footer: footerEn,
    header: headerEn,
    homepage: homepageEn,
    legal: legalEn,
    login: loginEn,
    shop: shopEn,
    organizationRequest: organizationRequestEn,
    organizationRequestStatus: organizationRequestStatusEn,
    organizationInfo: organizationInfoEn,
  },
  cs: {
    admin: adminCs,
    common: commonCs,
    courses: coursesCs,
    dashboard: dashboardCs,
    footer: footerCs,
    header: headerCs,
    homepage: homepageCs,
    legal: legalCs,
    login: loginCs,
    shop: shopCs,
    organizationRequest: organizationRequestCs,
    organizationRequestStatus: organizationRequestStatusCs,
    organizationInfo: organizationInfoCs,
  },
} as const

export type TranslationResources = typeof resources
