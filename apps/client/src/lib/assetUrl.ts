const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Resolves an asset path (e.g. "/uploads/foo.png") to an absolute URL
 * using the API base URL. Needed when the frontend and API are on
 * separate origins (e.g. Render static site + Render web service).
 */
export function getAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${apiBase}${path}`
}
