import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '@store/auth.store'
import { authApi } from '@api/auth.api'
import { TOKEN_STORE_KEY } from '@api/axios'
import type { LoginDto, RegisterDto } from '@types/auth.types'

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore()

  const signIn = async (dto: LoginDto) => {
    const res = await authApi.login(dto)
    await SecureStore.setItemAsync(TOKEN_STORE_KEY, res.access_token)
    login(res.access_token, res.user)
    return res
  }

  const signUp = async (dto: RegisterDto) => {
    const res = await authApi.register(dto)
    await SecureStore.setItemAsync(TOKEN_STORE_KEY, res.access_token)
    login(res.access_token, res.user)
    return res
  }

  const signOut = async () => {
    await SecureStore.deleteItemAsync(TOKEN_STORE_KEY)
    logout()
  }

  const restoreSession = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_STORE_KEY)
    if (!token) return false
    try {
      const me = await authApi.me()
      login(token, me)
      return true
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_STORE_KEY)
      return false
    }
  }

  return { user, token, isAuthenticated, signIn, signUp, signOut, restoreSession }
}
