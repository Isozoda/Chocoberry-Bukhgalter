import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: LucideIcon
  className?: string
  children?: ReactNode
}

export function PageHeader({ title, description, action, icon: Icon, className, children }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action}
      </div>
    </div>
  )
}
