import type { ApiError } from '@/lib/types'

export const ORG_INACTIVE_ERROR_CODE = 'ORG_INACTIVE'
export const ORG_INACTIVE_EVENT = 'organization-inactive'

export const isOrganizationInactiveError = (error: unknown): error is ApiError =>
  Boolean(
    error &&
      typeof error === 'object' &&
      'body' in error &&
      typeof (error as ApiError).body?.code === 'string' &&
      (error as ApiError).body?.code === ORG_INACTIVE_ERROR_CODE,
  )

export const getOrgSlugFromApiInput = (input: string) => {
  const match = input.match(/^\/orgs\/([^/]+)/)
  return match?.[1]
}

export const emitOrganizationInactiveEvent = (orgSlug?: string) => {
  if (typeof window === 'undefined' || !orgSlug) return

  window.dispatchEvent(
    new CustomEvent(ORG_INACTIVE_EVENT, {
      detail: { orgSlug },
    }),
  )
}
