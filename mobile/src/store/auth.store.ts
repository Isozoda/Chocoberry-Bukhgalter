import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import type { User } from '../types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  businessId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  businessId: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token, user) => {
    await SecureStore.setItemAsync('chocoberry_token', token)
    await SecureStore.setItemAsync('chocoberry_user', JSON.stringify(user))
    set({ token, user, businessId: user.businessId ?? null, isAuthenticated: true })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('chocoberry_token')
    await SecureStore.deleteItemAsync('chocoberry_user')
    set({ token: null, user: null, businessId: null, isAuthenticated: false })
  },

  setUser: (user) => set({ user, businessId: user.businessId ?? null }),

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('chocoberry_token')
      const userStr = await SecureStore.getItemAsync('chocoberry_user')
      if (token && userStr) {
        const user: User = JSON.parse(userStr)
        set({ token, user, businessId: user.businessId ?? null, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))
