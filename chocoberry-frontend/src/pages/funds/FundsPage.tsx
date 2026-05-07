import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, PiggyBank, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PageHeader } from '@/components/ui/PageHeader'
import { fundsApi } from '@/api/funds.api'
import FundTransactionForm from './FundTransactionForm'
import type { Fund, FundTransaction } from '@/types/fund.types'
import type { ColumnDef } from '@/components/ui/DataTable'

export default function FundsPage() {
  const { t } = useTranslation('funds')
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null)

  const { data: funds, isLoading } = useQuery({
    queryKey: ['funds'],
    queryFn: fundsApi.list,
  })

  const { data: transactions } = useQuery({
    queryKey: ['fund-transactions', selectedFundId],
    queryFn: () => fundsApi.getTransactions(selectedFundId!),
    enabled: !!selectedFundId,
  })

  const totalBalance = funds?.reduce((sum, f) => sum + parseFloat(f.balance), 0) ?? 0

  const columns: ColumnDef<Fund>[] = [
    {
      key: 'type',
      header: t('name'),
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name || t(`types.${row.type}`)}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.type}</p>
        </div>
      ),
    },
    {
      key: 'balance',
      header: t('balance'),
      cell: (row) => <MoneyDisplay amount={row.balance} className="font-semibold" />,
    },
    {
      key: 'updatedAt',
      header: t('lastUpdated'),
      cell: (row) => <span className="text-sm text-muted-foreground">{row.updatedAt?.slice(0, 10)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedFundId(row.id === selectedFundId ? null : row.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const txColumns: ColumnDef<FundTransaction>[] = [
    {
      key: 'date',
      header: t('date'),
      cell: (row) => <span className="text-sm text-muted-foreground">{row.date}</span>,
    },
    {
      key: 'type',
      header: t('type'),
      cell: (row) => (
        <Badge variant={row.type === 'INCOME' ? 'success' : 'destructive'}>
          {t(`txTypes.${row.type}`)}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: t('amount'),
      cell: (row) => <MoneyDisplay amount={row.amount} />,
    },
    {
      key: 'notes',
      header: t('notes'),
      cell: (row) => <span className="text-sm">{row.notes || '—'}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={PiggyBank}
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addTransaction')}
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{t('totalBalance')}</p>
          <p className="text-3xl font-bold mt-1">
            <MoneyDisplay amount={totalBalance.toString()} className="text-primary" />
          </p>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={funds ?? []}
        isLoading={isLoading}
        emptyMessage={t('noFunds')}
      />

      {selectedFundId && transactions && (
        <div className="space-y-2">
          <h3 className="font-semibold">{t('transactions')}</h3>
          <DataTable
            columns={txColumns}
            data={transactions}
            emptyMessage={t('noTransactions')}
          />
        </div>
      )}

      {showForm && (
        <FundTransactionForm
          funds={funds ?? []}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['funds'] })
            qc.invalidateQueries({ queryKey: ['fund-transactions'] })
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
