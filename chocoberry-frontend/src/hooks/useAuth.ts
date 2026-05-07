import { useAuthStore } from '@/store/auth.store'

export const useAuth = () => {
  const { user, token, businessId, isAuthenticated, login, logout, setUser } = useAuthStore()
  return { user, token, businessId, isAuthenticated, login, logout, setUser }
}
