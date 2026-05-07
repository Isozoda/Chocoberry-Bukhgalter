import { useAuth } from './useAuth'

export const usePermissions = () => {
  const { user } = useAuth()

  const isOwner = user?.role === 'OWNER'
  const isAdmin = user?.role === 'ADMIN' || isOwner
  const isStaff = !!user

  return { isOwner, isAdmin, isStaff }
}
