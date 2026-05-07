import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  businessId: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      businessId: null,
      isAuthenticated: false,
      login: (token, user) => {
        localStorage.setItem('chocoberry_token', token)
        set({
          token,
          user,
          businessId: user.businessId ?? null,
          isAuthenticated: true,
        })
      },
      logout: () => {
        localStorage.removeItem('chocoberry_token')
        set({ token: null, user: null, businessId: null, isAuthenticated: false })
      },
      setUser: (user) =>
        set({ user, businessId: user.businessId ?? null }),
    }),
    {
      name: 'chocoberry_auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        businessId: state.businessId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
