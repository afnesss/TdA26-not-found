const RESERVED_ROOT_SEGMENTS = new Set([
  '',
  'admin',
  'login',
  'courses',
  'dashboard',
  'course-share',
  'organization-request',
  'terms-of-use',
  'privacy-policy',
])

const trimTrailingSlash = (pathname: string) =>
  pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname

export const getOrgSlugFromPathname = (pathname: string) => {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  const segment = normalizedPathname.split('/')[1] ?? ''
  return RESERVED_ROOT_SEGMENTS.has(segment) ? undefined : segment || undefined
}

export const getCurrentOrgSlug = () => {
  if (typeof window === 'undefined') return undefined

  return getOrgSlugFromPathname(window.location.pathname)
}

export const isOrgRootPath = (pathname: string) => {
  const orgSlug = getOrgSlugFromPathname(pathname)
  return Boolean(orgSlug) && trimTrailingSlash(pathname) === `/${orgSlug}`
}

export const isOrgLoginPath = (pathname: string) => {
  const orgSlug = getOrgSlugFromPathname(pathname)
  return Boolean(orgSlug) && trimTrailingSlash(pathname) === `/${orgSlug}/login`
}

export const isOrgPasswordPath = (pathname: string) => {
  const orgSlug = getOrgSlugFromPathname(pathname)
  return Boolean(orgSlug) && trimTrailingSlash(pathname) === `/${orgSlug}/settings/password`
}

const resolveOrgSlug = (orgSlug?: string | null) => orgSlug ?? getCurrentOrgSlug()
const hasResolvedOrgSlug = (orgSlug?: string | null) => Boolean(resolveOrgSlug(orgSlug))

export const buildOrgBasePath = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug) ? `/${resolveOrgSlug(orgSlug)}` : ''

export const buildOrgCoursesPath = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug) ? `/${resolveOrgSlug(orgSlug)}/courses` : '/'

export const buildOrgCoursePath = (
  orgSlug: string | null | undefined,
  courseId: string,
) => (hasResolvedOrgSlug(orgSlug) ? `${buildOrgCoursesPath(orgSlug)}/${courseId}` : '/')

export const buildOrgModulePath = (
  orgSlug: string | null | undefined,
  courseId: string,
  moduleId: string,
) =>
  hasResolvedOrgSlug(orgSlug)
    ? `${buildOrgCoursePath(orgSlug, courseId)}/modules/${moduleId}`
    : '/'

export const buildOrgDashboardPath = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug) ? `/${resolveOrgSlug(orgSlug)}/dashboard` : '/'

export const buildOrgDashboardCoursePath = (
  orgSlug: string | null | undefined,
  courseId: string,
) =>
  hasResolvedOrgSlug(orgSlug)
    ? `${buildOrgDashboardPath(orgSlug)}/${courseId}`
    : '/'

export const buildOrgDashboardModulePath = (
  orgSlug: string | null | undefined,
  courseId: string,
  moduleId: string,
) =>
  hasResolvedOrgSlug(orgSlug)
    ? `${buildOrgDashboardCoursePath(orgSlug, courseId)}/modules/${moduleId}`
    : '/'

export const buildOrgLoginPath = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug) ? `/${resolveOrgSlug(orgSlug)}/login` : '/'

export const buildOrgInfoPath = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug) ? `/${resolveOrgSlug(orgSlug)}/info` : '/info'

export const buildOrgPasswordPath = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug)
    ? `/${resolveOrgSlug(orgSlug)}/settings/password`
    : '/settings/password'

export const buildOrgApiPrefix = (orgSlug?: string | null) =>
  resolveOrgSlug(orgSlug) ? `/orgs/${resolveOrgSlug(orgSlug)}` : ''
