import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { StatsCard } from '@/components/ui/StatsCard'
import { expensesApi } from '@/api/expenses.api'
import { formatDate } from '@/utils/date.util'
import ExpenseForm from './ExpenseForm'
import ExpenseBreakdown from './ExpenseBreakdown'
import type { Expense } from '@/types/expense.types'
import type { ColumnDef } from '@/components/ui/DataTable'
import toast from 'react-hot-toast'

export default function ExpensesPage() {
  const { t } = useTranslation('expenses')
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['expenses', page, dateRange],
    queryFn: () => expensesApi.list({
      page,
      limit: 20,
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
    }),
  })

  const { data: breakdown, isError: breakdownError } = useQuery({
    queryKey: ['expenses-breakdown', dateRange],
    queryFn: () => expensesApi.getBreakdown({
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-breakdown'] })
      toast.success(t('deleteSuccess'))
      setDeleteId(null)
    },
  })

  const columns: ColumnDef<Expense>[] = [
    {
      key: 'date',
      header: t('date'),
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.date)}</span>,
    },
    {
      key: 'expenseType',
      header: t('type'),
      cell: (row) => (
        <Badge variant="outline" className="font-medium">
          {t(`types.${row.expenseType}`)}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: t('description'),
      cell: (row) => <span className="text-sm text-muted-foreground max-w-[200px] truncate block">{row.description || '—'}</span>,
    },
    {
      key: 'vendor',
      header: t('vendor'),
      cell: (row) => <span className="text-sm">{row.vendor || '—'}</span>,
    },
    {
      key: 'amount',
      header: t('amount'),
      cell: (row) => <MoneyDisplay amount={row.amount} className="font-semibold text-red-600 dark:text-red-400" />,
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteId(row.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const totalAmount = breakdown?.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0) ?? 0

  if (isError || breakdownError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingDown className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-lg font-semibold">{t('common:errors.networkError')}</h3>
        <p className="text-muted-foreground mt-2">{t('common:errors.tryAgainLater') || 'Please try again later.'}</p>
        <Button variant="outline" className="mt-6" onClick={() => qc.invalidateQueries({ queryKey: ['expenses'] })}>
          {t('common:actions.refresh')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={TrendingDown}
        action={
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            {t('addExpense')}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label={t('totalExpenses')}
          value={totalAmount.toString()}
          isMoney
          icon={TrendingDown}
          iconColor="text-red-600"
        />
        {breakdown?.slice(0, 2).map((b) => (
          <StatsCard
            key={b.type}
            label={t(`types.${b.type}`)}
            value={b.total}
            isMoney
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{t('allExpenses')}</h2>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {breakdown && breakdown.length > 0 && (
        <ExpenseBreakdown data={breakdown} />
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={{
          page,
          total: data?.total ?? 0,
          limit: 20,
          onPageChange: setPage,
        }}
        emptyMessage={t('noExpenses')}
      />

      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['expenses'] })
            qc.invalidateQueries({ queryKey: ['expenses-breakdown'] })
            setShowForm(false)
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDesc')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
