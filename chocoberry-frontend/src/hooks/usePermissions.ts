import { useAuth } from './useAuth'

export const usePermissions = () => {
  const { user } = useAuth()

  const isAdmin = user?.role === 'ADMIN'
  const isCashier = user?.role === 'CASHIER'
  const isStaff = !!user

  return { isAdmin, isCashier, isStaff }
}
