import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PaymentMethodBadge } from '@/components/ui/PaymentMethodBadge'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { salesApi } from '@/api/sales.api'
import { formatDateTime } from '@/utils/date.util'
import type { Sale } from '@/types/sale.types'
import type { ColumnDef } from '@/components/ui/DataTable'

export default function SalesHistory() {
  const { t } = useTranslation('sales')
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, dateRange],
    queryFn: () => salesApi.list({
      page,
      limit: 20,
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
    }),
  })

  const columns: ColumnDef<Sale>[] = [
    {
      key: 'saleNumber',
      header: t('saleNumber'),
      cell: (row) => <span className="font-mono text-sm">#{row.saleNumber}</span>,
    },
    {
      key: 'createdAt',
      header: t('date'),
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'items',
      header: t('items'),
      cell: (row) => (
        <span className="text-sm">
          {row.items.length} {t('itemsCount')}
        </span>
      ),
    },
    {
      key: 'discount',
      header: t('discount'),
      cell: (row) =>
        parseFloat(row.discount) > 0 ? (
          <MoneyDisplay amount={row.discount} className="text-orange-600" />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'total',
      header: t('total'),
      cell: (row) => <MoneyDisplay amount={row.total} className="font-semibold" />,
    },
    {
      key: 'paymentMethod',
      header: t('paymentMethod'),
      cell: (row) => <PaymentMethodBadge method={row.paymentMethod} />,
    },
    {
      key: 'status',
      header: t('status'),
      cell: (row) => (
        <Badge variant={row.status === 'COMPLETED' ? 'success' : 'destructive'}>
          {t(`status.${row.status}`)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('history')}</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

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
        emptyMessage={t('noSales')}
      />
    </div>
  )
}
