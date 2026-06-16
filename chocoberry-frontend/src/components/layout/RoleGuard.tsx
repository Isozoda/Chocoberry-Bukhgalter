import { usePermissions } from '@/hooks/usePermissions'

interface RoleGuardProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function RoleGuard({ children, adminOnly }: RoleGuardProps) {
  const { isAdmin } = usePermissions()

  if (adminOnly && !isAdmin) return null

  return <>{children}</>
}
