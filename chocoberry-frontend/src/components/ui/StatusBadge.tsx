import { useTranslation } from 'react-i18next'
import { Badge } from './badge'
import type { SaleStatus } from '@/types/sale.types'

interface StatusBadgeProps {
  status: SaleStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()

  const variantMap = {
    COMPLETED: 'success' as const,
    REFUNDED: 'warning' as const,
    VOID: 'destructive' as const,
  }

  return (
    <Badge variant={variantMap[status]}>
      {t(`status.${status.toLowerCase()}`)}
    </Badge>
  )
}
