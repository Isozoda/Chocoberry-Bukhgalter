import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/decimal.util'
import type Decimal from 'decimal.js'

interface MoneyDisplayProps {
  amount: string | number | Decimal
  className?: string
  colored?: boolean
}

export function MoneyDisplay({ amount, className, colored }: MoneyDisplayProps) {
  const formatted = formatMoney(amount)
  const numAmount = parseFloat(amount?.toString() || '0')
  
  return (
    <span
      className={cn(
        'tabular-nums font-medium',
        colored && numAmount > 0 && 'text-green-600 dark:text-green-400',
        colored && numAmount < 0 && 'text-red-600 dark:text-red-400',
        className
      )}
    >
      {formatted}
    </span>
  )
}
