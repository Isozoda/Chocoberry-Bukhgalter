import { useTranslation } from 'react-i18next'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Button } from './button'
import { Skeleton } from './skeleton'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils'

export interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export type ColumnDef<T = Record<string, unknown>> = Column<T>

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  pagination?: {
    page: number
    total: number
    limit: number
    onPageChange: (page: number) => void
  }
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  isLoading?: boolean
  keyExtractor?: (row: T) => string
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
  pagination,
  onSort,
  sortKey,
  sortDir,
  isLoading,
  keyExtractor,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation()

  const effectivePage = pagination?.page ?? page ?? 1
  const effectiveTotal = pagination?.total ?? total ?? 0
  const effectiveLimit = pagination?.limit ?? limit ?? 10
  const effectiveOnPageChange = pagination?.onPageChange ?? onPageChange ?? (() => {})

  const totalPages = Math.ceil(effectiveTotal / effectiveLimit)
  const from = effectiveTotal === 0 ? 0 : (effectivePage - 1) * effectiveLimit + 1
  const to = Math.min(effectivePage * effectiveLimit, effectiveTotal)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!isLoading && data.length === 0) {
    return <EmptyState message={emptyMessage || t('empty.noData')} />
  }

  const handleSort = (key: string) => {
    if (!onSort) return
    if (sortKey === key) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(key, 'asc')
    }
  }

  const hasPagination = (pagination != null) || (total != null && onPageChange != null)

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-muted-foreground',
                    col.sortable && 'cursor-pointer hover:text-foreground select-none',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-40" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={keyExtractor ? keyExtractor(row) : i}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.cell
                      ? col.cell(row)
                      : col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t('pagination.showing', { from, to, total: effectiveTotal })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => effectiveOnPageChange(effectivePage - 1)}
              disabled={effectivePage <= 1}
            >
              {t('actions.previous')}
            </Button>
            <span className="px-2">
              {effectivePage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => effectiveOnPageChange(effectivePage + 1)}
              disabled={effectivePage >= totalPages}
            >
              {t('actions.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
