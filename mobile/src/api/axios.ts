import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'

const BASE_URL = 'http://192.168.1.100:3000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('chocoberry_token')
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
  async (error) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        await SecureStore.deleteItemAsync('chocoberry_token')
        Toast.show({ type: 'error', text1: 'Муддати кор тамом шуд', text2: 'Лутфан дубора ворид шавед' })
        return Promise.reject(error)
      }

      const message =
        data?.error?.message || data?.message || data?.error || 'Хатогӣ рӯй дод'
      const text = typeof message === 'string' ? message : 'Хатогӣ рӯй дод'

      if (status === 400 || status === 422 || status === 409) {
        Toast.show({ type: 'error', text1: 'Хатогӣ', text2: text })
        return Promise.reject(new Error(text))
      }

      if (status >= 500) {
        Toast.show({ type: 'error', text1: 'Хатогии сервер', text2: text })
        return Promise.reject(new Error(text))
      }
    } else if (error.request) {
      Toast.show({ type: 'error', text1: 'Хатогии шабака', text2: 'Пайвастагиро тафтиш кунед' })
    }

    return Promise.reject(error)
  }
)

export default api
