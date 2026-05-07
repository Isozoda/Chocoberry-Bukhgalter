import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '@/api/inventory.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function InventoryValuation() {
  const { t } = useTranslation('inventory')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'valuation'],
    queryFn: inventoryApi.valuation,
  })

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <PageHeader title={t('valuation')} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-lg font-bold border-b pb-3 mb-3">
            <span>{t('grandTotal')}</span>
            <MoneyDisplay amount={data?.totalValue || '0'} className="text-2xl text-primary" />
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t('common:labels.name')}</th>
                <th className="text-right py-2">{t('currentStock')}</th>
                <th className="text-right py-2">{t('avgCost')}</th>
                <th className="text-right py-2">{t('totalValue')}</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-right tabular-nums">{item.stock}</td>
                  <td className="py-2 text-right"><MoneyDisplay amount={item.avgCost} /></td>
                  <td className="py-2 text-right"><MoneyDisplay amount={item.value} className="font-medium" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
