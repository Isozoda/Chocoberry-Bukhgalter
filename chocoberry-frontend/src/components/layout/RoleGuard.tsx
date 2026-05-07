import { usePermissions } from '@/hooks/usePermissions'

interface RoleGuardProps {
  children: React.ReactNode
  ownerOnly?: boolean
  adminOnly?: boolean
}

export function RoleGuard({ children, ownerOnly, adminOnly }: RoleGuardProps) {
  const { isOwner, isAdmin } = usePermissions()

  if (ownerOnly && !isOwner) return null
  if (adminOnly && !isAdmin) return null

  return <>{children}</>
}
