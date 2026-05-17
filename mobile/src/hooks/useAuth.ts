import { useAuthStore } from '../store/auth.store'

export const useAuth = () => {
  const { user, token, businessId, isAuthenticated, login, logout, setUser } = useAuthStore()
  const isOwner = user?.role === 'OWNER'
  const isAdmin = user?.role === 'ADMIN' || isOwner
  return { user, token, businessId, isAuthenticated, login, logout, setUser, isOwner, isAdmin }
}
