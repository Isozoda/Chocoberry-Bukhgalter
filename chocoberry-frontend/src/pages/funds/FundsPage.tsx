import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, PiggyBank, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PageHeader } from '@/components/ui/PageHeader'
import { fundsApi } from '@/api/funds.api'
import FundTransactionForm from './FundTransactionForm'
import type { Fund, FundTransaction, FundType } from '@/types/fund.types'
import type { ColumnDef } from '@/components/ui/DataTable'
import toast from 'react-hot-toast'

const FUND_TYPES: FundType[] = ['CHARITY', 'RESERVE', 'RENOVATION', 'EMERGENCY', 'TAX_RESERVE', 'OTHER']

function CreateFundDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslation('funds')
  const [type, setType] = useState<FundType>('CHARITY')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: () => fundsApi.create({ type, name: name || t(`types.${type}`), notes: notes || undefined }),
    onSuccess: () => {
      toast.success(t('fundCreated'))
      onSuccess()
    },
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('createFund')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('fundType')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as FundType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUND_TYPES.map((ft) => (
                  <SelectItem key={ft} value={ft}>{t(`types.${ft}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('name')}</Label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(`types.${type}`)}
            />
          </div>
          <div>
            <Label>{t('notes')}</Label>
            <Input
              className="mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesOptional')}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? t('common:loading') : t('common:actions.create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function FundsPage() {
  const { t } = useTranslation('funds')
  const qc = useQueryClient()
  const [showTxForm, setShowTxForm] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
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
      cell: (row) => <span className="text-sm text-muted-foreground">{new Date(row.date).toLocaleDateString()}</span>,
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

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['funds'] })
    qc.invalidateQueries({ queryKey: ['fund-transactions'] })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={PiggyBank}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createFund')}
            </Button>
            <Button onClick={() => setShowTxForm(true)} disabled={!funds?.length}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addTransaction')}
            </Button>
          </div>
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

      {showTxForm && (
        <FundTransactionForm
          funds={funds ?? []}
          onClose={() => setShowTxForm(false)}
          onSuccess={() => { invalidate(); setShowTxForm(false) }}
        />
      )}

      {showCreateForm && (
        <CreateFundDialog
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => { invalidate(); setShowCreateForm(false) }}
        />
      )}
    </div>
  )
}
