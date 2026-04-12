import i18n from '@/i18n'
import {
  clearAdminToken,
  clearOrgToken,
  getAdminToken,
  getOrgToken,
} from '@/auth/storage'
import {
  emitOrganizationInactiveEvent,
  getOrgSlugFromApiInput,
  isOrganizationInactiveError,
} from '@/lib/organizationAccess'
import { buildLocaleHeaders } from '@/lib/i18n'

type ApiClientOptions = {
  headers?: HeadersInit
  token?: string
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const getApiBaseUrl = () => trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? '')

const resolveStoredToken = (input: string) => {
  const orgSlug = getOrgSlugFromApiInput(input)
  if (orgSlug) {
    return getOrgToken(orgSlug)
  }

  if (input === '/admin/auth/login' || input.startsWith('/admin/')) {
    return getAdminToken()
  }

  return null
}

const clearStoredToken = (input: string) => {
  const orgSlug = getOrgSlugFromApiInput(input)
  if (orgSlug) {
    clearOrgToken(orgSlug)
    return
  }

  if (input === '/admin/auth/me' || input.startsWith('/admin/')) {
    clearAdminToken()
  }
}

export const buildApiUrl = (input: string) => {
  const normalizedInput = input.startsWith('/') ? input : `/${input}`
  const apiPath =
    normalizedInput === '/api' || normalizedInput.startsWith('/api/')
      ? normalizedInput
      : `/api${normalizedInput}`

  return `${getApiBaseUrl()}${apiPath}`
}

export default async function apiFetch<T>(
  input: string,
  options?: RequestInit,
  clientOptions?: ApiClientOptions,
): Promise<T> {
  const safeOptions: RequestInit = options ?? {}
  const safeClientOptions: ApiClientOptions = clientOptions ?? {}

  const { headers, token } = safeClientOptions

  const defaultHeaders: HeadersInit = {}
  if (!(safeOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  const authToken = token ?? resolveStoredToken(input)

  let response: Response
  try {
    response = await fetch(buildApiUrl(input), {
      ...safeOptions,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...buildLocaleHeaders(),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
        ...safeOptions.headers,
      },
    })
  } catch {
    throw {
      status: 0,
      statusText: 'Network Error',
      isNetworkError: true,
      body: { message: i18n.t('errors.connection', { ns: 'common' }) },
    }
  }

  if (!response.ok) {
    let errorBody: unknown = null

    try {
      errorBody = await response.json()
    } catch {
      throw new Error(`API ${response.status}: ${response.statusText}`)
    }

    const apiError = {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    }

    if (response.status === 401) {
      clearStoredToken(input)
    }

    if (isOrganizationInactiveError(apiError)) {
      emitOrganizationInactiveEvent(getOrgSlugFromApiInput(input))
    }

    throw apiError
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json() as Promise<T>
}
