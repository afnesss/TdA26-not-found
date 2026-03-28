import {
  emitOrganizationInactiveEvent,
  getOrgSlugFromApiInput,
  isOrganizationInactiveError,
} from '@/lib/organizationAccess'

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

  const { headers, token } = safeClientOptions

  const defaultHeaders: HeadersInit = {}
  if (!(safeOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`/api${input}`, {
      ...safeOptions,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...headers,
        ...safeOptions?.headers,
      },
    })
  } catch (error) {
    // Network error (no internet, server down, etc.)
    throw {
      status: 0,
      statusText: 'Network Error',
      isNetworkError: true,
      body: { message: 'Chyba připojení' },
    }
  }

  if (!response.ok) {
    let errorBody: unknown = null

    try {
      errorBody = await response.json()
    } catch (error) {
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
