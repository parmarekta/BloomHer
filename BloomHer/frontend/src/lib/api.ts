// Central API endpoint configuration. Override in .env.local when needed.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

export function feedbackHeaders(): HeadersInit {
  const token = sessionStorage.getItem('bloomher.feedback.token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
