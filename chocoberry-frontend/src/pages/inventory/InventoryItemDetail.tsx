import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '@/api/inventory.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { usePagination } from '@/hooks/usePagination'
import { formatDate } from '@/utils/date.util'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function InventoryItemDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('inventory')
  const { page, limit, setPage } = usePagination()

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryApi.getById(id!),
  })

  const { data: history } = useQuery({
    queryKey: ['inventory', id, 'history', { page, limit }],
    queryFn: () => inventoryApi.getHistory(id!, { page, limit }),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
  if (!item) return null

  const chartData = (history?.data || []).slice().reverse().map((h) => ({
    date: formatDate(h.createdAt, 'DD.MM'),
    stock: parseFloat(h.stockAfter),
  }))

  return (
    <div className="space-y-6">
      <PageHeader title={item.name}>
        <Badge variant="secondary">{item.category}</Badge>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('currentStock')}</p>
            <p className="text-xl font-bold tabular-nums">{item.currentStock} {item.unit.toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('avgCost')}</p>
            <MoneyDisplay amount={item.avgCost} className="text-xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('minStock')}</p>
            <p className="text-xl font-bold tabular-nums">{item.minStockLevel} {item.unit.toLowerCase()}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Stock Level (last 30 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="stock" stroke="#E8593C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={history?.data || []}
        total={history?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        keyExtractor={(r) => r.id as string}
        columns={[
          { key: 'createdAt', header: t('common:labels.date'), render: (r) => formatDate(r.createdAt as string) },
          {
            key: 'type',
            header: t('common:labels.type'),
            render: (r) => <Badge variant="secondary" className="text-xs">{r.type as string}</Badge>,
          },
          { key: 'quantity', header: t('common:labels.quantity'), render: (r) => `${r.quantity} ${item.unit.toLowerCase()}` },
          { key: 'stockBefore', header: t('stockBefore'), render: (r) => `${r.stockBefore}` },
          { key: 'stockAfter', header: t('stockAfter'), render: (r) => `${r.stockAfter}` },
          { key: 'reason', header: t('reason') },
        ]}
      />
    </div>
  )
}
