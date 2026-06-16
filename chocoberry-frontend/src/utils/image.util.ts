// API responses store product photos as a relative path (e.g. "/uploads/products/x.jpg"),
// served by the backend outside its /api/v1 prefix. This resolves it to an absolute URL.
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string)?.replace(/\/api\/v1\/?$/, '') ?? ''

export function getImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path}`
}
