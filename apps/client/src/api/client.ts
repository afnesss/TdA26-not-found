import i18n from '@/i18n'
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

export default async function apiFetch<T>(
  input: string,
  options?: RequestInit,
  clientOptions?: ApiClientOptions,
): Promise<T> {
  const safeOptions: RequestInit = options ?? {}
  const safeClientOptions: ApiClientOptions = clientOptions ?? {}

  const { headers } = safeClientOptions

  const defaultHeaders: HeadersInit = {}
  if (!(safeOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
    response = await fetch(`${baseUrl}/api${input}`, {
      ...safeOptions,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...buildLocaleHeaders(),
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
