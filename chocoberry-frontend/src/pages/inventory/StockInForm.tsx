import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/api/inventory.api'
import { stockInSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { QuantityInput } from '@/components/forms/QuantityInput'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { InventoryItem } from '@/types/inventory.types'
import type { z } from 'zod'

type StockInFormData = z.infer<typeof stockInSchema>

interface Props {
  item: InventoryItem
  onSuccess?: () => void
}

export default function StockInForm({ item, onSuccess }: Props) {
  const { t } = useTranslation('inventory')
  const queryClient = useQueryClient()

  const { handleSubmit, setValue, watch, register } = useForm<StockInFormData>({
    resolver: zodResolver(stockInSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: StockInFormData) =>
      inventoryApi.stockIn(item.id, {
        quantity: parseFloat(data.quantity),
        unitCost: data.unitCost ? parseFloat(data.unitCost) : undefined,
        notes: data.notes,
        date: data.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('common:toast.saved'))
      onSuccess?.()
    },
  })

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label>{t('common:labels.quantity')} ({item.unit.toLowerCase()}) *</Label>
        <QuantityInput
          value={watch('quantity')}
          onChange={(v) => setValue('quantity', v)}
          unit={item.unit.toLowerCase()}
        />
      </div>

      <div className="space-y-2">
        <Label>Unit Cost</Label>
        <MoneyInput value={watch('unitCost')} onChange={(v) => setValue('unitCost', v)} />
      </div>

      <div className="space-y-2">
        <Label>{t('common:labels.date')}</Label>
        <Input type="date" {...register('date')} />
      </div>

      <div className="space-y-2">
        <Label>{t('common:labels.notes')}</Label>
        <Textarea {...register('notes')} rows={2} />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
        {t('stockIn')}
      </Button>
    </form>
  )
}
