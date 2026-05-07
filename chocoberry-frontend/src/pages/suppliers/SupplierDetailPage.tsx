import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { suppliersApi } from '@/api/suppliers.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/badge'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/utils/date.util'
import { addMoney } from '@/utils/decimal.util'
import { usePagination } from '@/hooks/usePagination'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('suppliers')
  const { page, limit, setPage } = usePagination()

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersApi.getById(id!),
  })

  const { data: purchases } = useQuery({
    queryKey: ['suppliers', id, 'purchases', { page, limit }],
    queryFn: () => suppliersApi.getPurchases(id!, { page, limit }),
    enabled: !!id,
  })

  const { data: priceHistory = [] } = useQuery({
    queryKey: ['suppliers', id, 'price-history'],
    queryFn: () => suppliersApi.getPriceHistory(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
  if (!supplier) return null

  const totalSpent = purchases?.data
    ? addMoney(...purchases.data.map((p) => p.totalAmount)).toString()
    : '0'

  const priceChartData = priceHistory.map((p) => ({
    date: formatDate(p.date, 'DD.MM'),
    price: parseFloat(p.pricePerUnit),
    item: p.inventoryItem?.name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title={supplier.name}>
        <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
          {supplier.isActive ? t('active') : t('inactive')}
        </Badge>
        <Badge variant="secondary">{t(supplier.type.toLowerCase())}</Badge>
      </PageHeader>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">{t('purchases')}</TabsTrigger>
          <TabsTrigger value="priceHistory">{t('priceHistory')}</TabsTrigger>
          <TabsTrigger value="stats">{t('statistics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-4">
          <DataTable
            data={purchases?.data || []}
            total={purchases?.total || 0}
            page={page}
            limit={limit}
            onPageChange={setPage}
            keyExtractor={(r) => r.id as string}
            columns={[
              { key: 'createdAt', header: t('common:labels.date'), render: (r) => formatDate(r.createdAt as string) },
              { key: 'inventoryItem', header: t('common:labels.name'), render: (r) => (r.inventoryItem as { name: string })?.name || '' },
              { key: 'quantity', header: t('common:labels.quantity'), render: (r) => `${r.quantity} ${r.unit}` },
              { key: 'pricePerUnit', header: t('common:labels.price'), render: (r) => <MoneyDisplay amount={r.pricePerUnit as string} /> },
              { key: 'totalAmount', header: t('common:labels.total'), render: (r) => <MoneyDisplay amount={r.totalAmount as string} /> },
            ]}
          />
        </TabsContent>

        <TabsContent value="priceHistory" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('priceHistory')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#E8593C" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t('totalSpentMonth')}</p>
                <MoneyDisplay amount={totalSpent} className="text-2xl font-bold" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{purchases?.total || 0}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
