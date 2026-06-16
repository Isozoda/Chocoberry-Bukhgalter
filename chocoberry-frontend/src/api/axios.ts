import axios from 'axios'
import toast from 'react-hot-toast'
import i18n from '@/i18n'

// Backend errors that are sent as a stable code + structured `details`
// (rather than a human sentence) get rendered through i18n here, so the
// user always sees a localized message instead of raw backend English.
const ERROR_CODE_I18N_KEY: Record<string, string> = {
  INSUFFICIENT_CASH_BALANCE: 'common:errors.insufficientCashBalance',
  INSUFFICIENT_CARD_BALANCE: 'common:errors.insufficientCardBalance',
}

const CARD_TYPE_LABEL: Record<string, string> = {
  DUSHANBE_CITY: 'DC',
  ALIF: 'Alif',
}

function resolveErrorMessage(data: any, fallback: string): string {
  const code = data?.error?.message
  if (typeof code === 'string' && ERROR_CODE_I18N_KEY[code]) {
    const details = data?.error?.details || {}
    const cardLabel = CARD_TYPE_LABEL[details.cardType] || details.cardType
    return i18n.t(ERROR_CODE_I18N_KEY[code], { ...details, cardLabel })
  }
  return data?.error?.message || data?.message || data?.error || fallback
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chocoberry_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data
    }
    return data
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        localStorage.removeItem('chocoberry_token')
        localStorage.removeItem('chocoberry_auth')
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (status === 400 || status === 422) {
        const message = resolveErrorMessage(data, 'Validation error')
        toast.error(typeof message === 'string' ? message : JSON.stringify(message))
        const enhancedError = new Error(typeof message === 'string' ? message : 'Validation error') as Error & {
          details?: Array<{ field: string; message: string }>
        }
        enhancedError.details = data?.error?.details
        return Promise.reject(enhancedError)
      }

      if (status === 409) {
        const message = data?.error?.message || data?.message || 'Conflict error'
        toast.error(typeof message === 'string' ? message : 'Conflict error')
        return Promise.reject(new Error(typeof message === 'string' ? message : 'Conflict error'))
      }

      if (status >= 500) {
        const message = data?.error?.message || data?.message || 'Server error. Please try again later.'
        toast.error(typeof message === 'string' ? message : 'Server error')
        return Promise.reject(new Error(typeof message === 'string' ? message : 'Server error'))
      }

      const message = data?.error?.message || data?.message || 'Request failed'
      return Promise.reject(new Error(typeof message === 'string' ? message : 'Request failed'))
    }

    if (error.request) {
      toast.error('Network error. Check your connection.')
    }

    return Promise.reject(error)
  }
)

export default api
