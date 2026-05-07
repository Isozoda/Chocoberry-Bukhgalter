import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { cashboxApi } from '@/api/cashbox.api'
import { formatDateTime } from '@/utils/date.util'
import type { CashboxOperation, CashboxOperationDto } from '@/types/cashbox.types'
import type { ColumnDef } from '@/components/ui/DataTable'
import toast from 'react-hot-toast'

export default function CashboxPage() {
  const { t } = useTranslation('cashbox')
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)

  const { data: balance } = useQuery({
    queryKey: ['cashbox-balance'],
    queryFn: cashboxApi.getBalance,
  })

  const { data: operations, isLoading } = useQuery({
    queryKey: ['cashbox-operations', page],
    queryFn: () => cashboxApi.getHistory({ page, limit: 20 }),
  })

  type CashboxForm = {
    type: 'CASH_IN' | 'CASH_OUT'
    amount: string
    description?: string
  }

  const form = useForm<CashboxForm>({
    defaultValues: {
      type: 'CASH_IN',
      amount: '',
      description: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (d: CashboxForm) => cashboxApi.operation(d as CashboxOperationDto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashbox-balance'] })
      qc.invalidateQueries({ queryKey: ['cashbox-operations'] })
      toast.success(t('operationAdded'))
      setShowForm(false)
      form.reset({ type: 'CASH_IN', amount: '', description: '' })
    },
  })

  const columns: ColumnDef<CashboxOperation>[] = [
    {
      key: 'createdAt',
      header: t('date'),
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'type',
      header: t('type'),
      cell: (row) => {
        const isIn = row.type === 'CASH_IN' || row.type === 'IN' || row.type === 'OPEN'
        return (
          <div className="flex items-center gap-2">
            {isIn ? (
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            )}
            <Badge variant="outline" className="text-xs">{row.type}</Badge>
          </div>
        )
      },
    },
    {
      key: 'description',
      header: t('description'),
      cell: (row) => <span className="text-sm">{row.description || '—'}</span>,
    },
    {
      key: 'amount',
      header: t('amount'),
      cell: (row) => {
        const isIn = row.type === 'CASH_IN' || row.type === 'IN' || row.type === 'OPEN'
        return (
          <MoneyDisplay
            amount={row.amount}
            className={isIn ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
          />
        )
      },
    },
    {
      key: 'balanceAfter',
      header: t('balance'),
      cell: (row) => <MoneyDisplay amount={row.balanceAfter} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={Wallet}
        action={
          <Button onClick={() => setShowForm(true)}>
            {t('addOperation')}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('cashBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <MoneyDisplay amount={balance?.cashBalance ?? '0'} className="text-green-600" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('cardBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <MoneyDisplay amount={balance?.cardBalance ?? '0'} className="text-blue-600" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('totalBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <MoneyDisplay amount={balance?.totalBalance ?? '0'} className="text-primary" />
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={operations?.data ?? []}
        isLoading={isLoading}
        pagination={{
          page,
          total: operations?.total ?? 0,
          limit: 20,
          onPageChange: setPage,
        }}
        emptyMessage={t('noOperations')}
      />

      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('addOperation')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('type')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH_IN">{t('types.CASH_IN')}</SelectItem>
                          <SelectItem value="CASH_OUT">{t('types.CASH_OUT')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('amount')}</FormLabel>
                      <FormControl>
                        <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('description')}</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                    {t('common:actions.cancel')}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                    {mutation.isPending ? t('common:loading') : t('common:actions.save')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

