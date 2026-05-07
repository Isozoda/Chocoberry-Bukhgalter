import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '@/api/products.api'
import { inventoryApi } from '@/api/inventory.api'
import Decimal from 'decimal.js'
import { addMoney, multiplyMoney } from '@/utils/decimal.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Product, RecipeItem } from '@/types/product.types'

interface RecipeRow {
  inventoryItemId: string
  quantity: string
  unit: string
}

interface Props {
  open: boolean
  product: Product
  onClose: () => void
}

export default function RecipeBuilder({ open, product, onClose }: Props) {
  const { t, i18n } = useTranslation('products')
  const queryClient = useQueryClient()

  const existingRecipe = product.recipe || []
  const [rows, setRows] = useState<RecipeRow[]>(
    existingRecipe.map((r) => ({
      inventoryItemId: r.inventoryItemId,
      quantity: r.quantity,
      unit: r.unit,
    }))
  )

  const { data: inventoryList } = useQuery({
    queryKey: ['inventory', { limit: 200 }],
    queryFn: () => inventoryApi.list({ limit: 200 }),
  })

  const saveMutation = useMutation({
    mutationFn: (items: RecipeRow[]) =>
      productsApi.setRecipe(product.id, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('common:toast.saved'))
      onClose()
    },
  })

  const addRow = () => {
    setRows([...rows, { inventoryItemId: '', quantity: '0', unit: 'KG' }])
  }

  const removeRow = (i: number) => {
    setRows(rows.filter((_, idx) => idx !== i))
  }

  const updateRow = (i: number, field: keyof RecipeRow, value: string) => {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  const estimatedCost = rows.reduce((acc, row) => {
    const item = inventoryList?.data.find((inv) => inv.id === row.inventoryItemId)
    if (!item || !row.quantity) return acc
    return acc.plus(multiplyMoney(row.quantity, item.avgCost))
  }, new Decimal(0))

  const productName = i18n.language === 'tg' ? product.nameTg : product.nameRu

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('recipeFor', { name: productName })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5 space-y-1">
                {i === 0 && <Label className="text-xs">{t('ingredient')}</Label>}
                <Select value={row.inventoryItemId} onValueChange={(v) => updateRow(i, 'inventoryItemId', v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryList?.data.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 space-y-1">
                {i === 0 && <Label className="text-xs">{t('common:labels.quantity')}</Label>}
                <Input
                  className="h-8 text-sm"
                  type="number"
                  step="0.001"
                  value={row.quantity}
                  onChange={(e) => updateRow(i, 'quantity', e.target.value)}
                />
              </div>
              <div className="col-span-3 space-y-1">
                {i === 0 && <Label className="text-xs">{t('common:labels.unit')}</Label>}
                <Select value={row.unit} onValueChange={(v) => updateRow(i, 'unit', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['KG', 'GRAM', 'LITER', 'ML', 'PIECE'].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => removeRow(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addRow} className="w-full">
          <Plus className="h-4 w-4 mr-1" /> {t('addIngredient')}
        </Button>

        <div className="p-3 bg-muted rounded-lg flex justify-between text-sm">
          <span>{t('estimatedCost')}</span>
          <MoneyDisplay amount={estimatedCost.toString()} className="font-bold" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button
            onClick={() => saveMutation.mutate(rows.filter((r) => r.inventoryItemId))}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
            {t('saveRecipe')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
