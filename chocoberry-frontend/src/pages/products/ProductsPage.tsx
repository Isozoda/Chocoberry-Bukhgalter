import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { divideMoney, subtractMoney } from '@/utils/decimal.util'
import type { Product, CupType } from '@/types/product.types'
import ProductFormDialog from './ProductFormDialog'
import RecipeBuilder from './RecipeBuilder'

const CUP_TYPES: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'products:all' },
  { value: 'CUP_300_ML', label: 'products:cup300' },
  { value: 'CUP_400_ML', label: 'products:cup400' },
  { value: 'CUP_80SM', label: 'products:cup80' },
  { value: 'CUP_90SM', label: 'products:cup90' },
  { value: 'CUP_ICE_CREAM', label: 'products:iceCream' },
  { value: 'OTHER', label: 'products:other' },
]

export default function ProductsPage() {
  const { t, i18n } = useTranslation('products')
  const queryClient = useQueryClient()
  const [cupType, setCupType] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products', { cupType }],
    queryFn: () => productsApi.list({ cupType: cupType === 'ALL' ? undefined : cupType, limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('common:toast.deleted'))
      setDeleteId(null)
    },
  })

  const getMargin = (price: string, cost: string) => {
    const p = parseFloat(price)
    const c = parseFloat(cost)
    if (p <= 0) return '0'
    return divideMoney(subtractMoney(price, cost), price).times(100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={<Button onClick={() => { setEditProduct(null); setFormOpen(true) }}><Plus className="h-4 w-4 mr-1" />{t('addProduct')}</Button>}
      />

      <Tabs value={cupType} onValueChange={setCupType}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CUP_TYPES.map((ct) => (
            <TabsTrigger key={ct.value} value={ct.value}>{t(ct.label.replace('products:', ''))}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState message={t('common:empty.noData')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.data.map((product) => {
            const name = (i18n.language === 'tg' ? product.nameTg : product.nameRu) ?? product.name
            const margin = getMargin(product.price, product.cost)
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{name}</h3>
                    {product.cupType && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {product.cupType.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('price')}</span>
                      <MoneyDisplay amount={product.price} className="font-medium" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('cost')}</span>
                      <MoneyDisplay amount={product.cost || '0'} className="text-muted-foreground" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('common:labels.margin')}</span>
                      <span className={parseFloat(margin) > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                        {margin}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 pt-1">
                    <Button size="sm" variant="outline" className="flex-1"
                      onClick={() => { setEditProduct(product); setFormOpen(true) }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1"
                      onClick={() => setRecipeProduct(product)}>
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive"
                      onClick={() => setDeleteId(product.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        product={editProduct}
        onClose={() => setFormOpen(false)}
      />

      {recipeProduct && (
        <RecipeBuilder
          open={!!recipeProduct}
          product={recipeProduct}
          onClose={() => setRecipeProduct(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
