import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/api/products.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useTranslation } from 'react-i18next'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation('products')

  const { data: product, isLoading } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id!),
  })

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
  if (!product) return null

  const name = (i18n.language === 'tg' ? product.nameTg : product.nameRu) ?? product.name

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={name}>
        {product.cupType && <Badge variant="secondary">{product.cupType.replace(/_/g, ' ')}</Badge>}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('price')}</p>
            <MoneyDisplay amount={product.price} className="text-2xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('cost')}</p>
            <MoneyDisplay amount={product.cost || '0'} className="text-2xl font-bold" />
          </CardContent>
        </Card>
      </div>

      {product.recipe && product.recipe.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t('recipe')}</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">{t('ingredient')}</th>
                  <th className="text-right py-2">{t('common:labels.quantity')}</th>
                  <th className="text-right py-2">{t('common:labels.unit')}</th>
                </tr>
              </thead>
              <tbody>
                {product.recipe.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">{item.inventoryItem?.name}</td>
                    <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2 text-right">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
