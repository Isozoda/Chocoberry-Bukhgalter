import { useTranslation } from 'react-i18next'
import { Badge } from './badge'
import type { PaymentMethod } from '@/types/sale.types'

interface PaymentMethodBadgeProps {
  method: PaymentMethod
}

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const { t } = useTranslation()

  const variantMap: Record<string, 'success' | 'info' | 'secondary'> = {
    CASH: 'success',
    CARD: 'info',
    TRANSFER: 'info',
    MIXED: 'secondary',
  }

  return (
    <Badge variant={variantMap[method]}>
      {t(`payment.${method.toLowerCase()}`)}
    </Badge>
  )
}
