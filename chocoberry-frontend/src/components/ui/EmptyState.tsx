import { PackageSearch } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message?: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ message = 'No data available', icon, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        {icon || <PackageSearch className="h-8 w-8 text-muted-foreground" />}
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
