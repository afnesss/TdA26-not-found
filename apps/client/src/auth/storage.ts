const ADMIN_TOKEN_KEY = 'auth.admin.token'
const ORG_TOKEN_KEY_PREFIX = 'auth.org.token'

const canUseSessionStorage = () =>
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'

const buildOrgTokenKey = (orgSlug: string) => `${ORG_TOKEN_KEY_PREFIX}:${orgSlug}`

export const setAdminToken = (token: string) => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export const getAdminToken = () => {
  if (!canUseSessionStorage()) return null
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export const clearAdminToken = () => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export const setOrgToken = (orgSlug: string, token: string) => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.setItem(buildOrgTokenKey(orgSlug), token)
}

export const getOrgToken = (orgSlug: string) => {
  if (!canUseSessionStorage()) return null
  return window.sessionStorage.getItem(buildOrgTokenKey(orgSlug))
}

export const clearOrgToken = (orgSlug: string) => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.removeItem(buildOrgTokenKey(orgSlug))
}
