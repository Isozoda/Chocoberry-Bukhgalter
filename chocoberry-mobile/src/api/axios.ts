import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import { router } from 'expo-router'

const TOKEN_KEY = 'chocoberry_token'

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => {
    if (res.data?.data !== undefined) return res.data.data
    return res.data
  },
  async (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message

    if (status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      router.replace('/(auth)/login')
      return Promise.reject(new Error('Мӯҳлати сессия гузашт'))
    }

    if (status >= 400 && status < 500) {
      Toast.show({ type: 'error', text1: message })
    } else if (status >= 500) {
      Toast.show({ type: 'error', text1: 'Хатои сервер. Дубора кӯшиш кунед.' })
    }

    return Promise.reject(new Error(message))
  }
)

export const TOKEN_STORE_KEY = TOKEN_KEY
