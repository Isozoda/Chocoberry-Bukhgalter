import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  businessId?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  businessId: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setBusinessId: (id: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  businessId: null,
  isAuthenticated: false,
  login: (token, user) =>
    set({ token, user, isAuthenticated: true, businessId: user.businessId ?? null }),
  logout: () => set({ user: null, token: null, businessId: null, isAuthenticated: false }),
  setBusinessId: (id) => set({ businessId: id }),
}))
