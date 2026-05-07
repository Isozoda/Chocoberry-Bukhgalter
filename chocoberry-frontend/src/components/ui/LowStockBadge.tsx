import { Badge } from './badge'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LowStockBadgeProps {
  currentStock: string
  minStockLevel: string
  unit: string
  className?: string
}

export function LowStockBadge({ currentStock, minStockLevel, unit, className }: LowStockBadgeProps) {
  const isLow = parseFloat(currentStock) < parseFloat(minStockLevel)

  if (!isLow) return null

  return (
    <Badge variant="destructive" className={cn('gap-1', className)}>
      <AlertTriangle className="h-3 w-3" />
      {currentStock} {unit}
    </Badge>
  )
}
