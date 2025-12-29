
type ApiClientOptions = {
  headers? : HeadersInit,
  token? : string
}

export default async function apiFetch<T>(
  input: string,
  options?: RequestInit,
  clientOptions?: ApiClientOptions
): Promise<T> {
  
  const safeOptions: RequestInit = options ?? {}
  const safeClientOptions: ApiClientOptions = clientOptions ?? {}

  const { headers, token } = safeClientOptions

///api/${input}
//http://localhost:3000${input}

  const response = await fetch(`api/${input}`, {
    ...safeOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
      ...safeOptions?.headers,
    },
  })
  if (!response.ok){
    let errorBody: unknown = null;

    try {
      errorBody = response.json();
    } catch (error) {
      throw new Error(
      `API ${response.status}: ${JSON.stringify(errorBody)}`
    );
    }

    throw {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    }
  }

  if (response.status === 204){
    return null as T;
  }

  return response.json() as Promise<T>;
}