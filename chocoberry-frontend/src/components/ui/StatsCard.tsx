import { Card, CardContent } from './card'
import { MoneyDisplay } from './MoneyDisplay'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  isMoney?: boolean
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconColor?: string
  isLoading?: boolean
  className?: string
}

export function StatsCard({
  label,
  value,
  isMoney = true,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  isLoading,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {isMoney ? (
                <MoneyDisplay amount={value.toString()} />
              ) : (
                value
              )}
            </p>
            {change !== undefined && (
              <p className={cn(
                'text-xs mt-1',
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% {changeLabel}
              </p>
            )}
          </div>
          {Icon && (
            <div className="rounded-full bg-primary/10 p-3 ml-4">
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
