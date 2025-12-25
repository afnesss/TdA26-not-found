const base = import.meta.env.VITE_API_BASE_URL;

type ApiClientOptions = {
  headers? : HeadersInit,
  token? : string
}

export async function apiClient<T>(
  input: string,
  options: RequestInit,
  clientOptions: ApiClientOptions
): Promise<T> {
  
  const {headers, token} = clientOptions;

  const response = await fetch(`/api/${input}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
      ...options.headers,
    },
  })
  if (!response.ok){
    let errorBody: unknown = null;

    try {
      errorBody = response.json();
    } catch (error) {
      console.log('error');
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