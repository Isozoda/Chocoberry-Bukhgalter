import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/api/inventory.api'
import { stockOutSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { QuantityInput } from '@/components/forms/QuantityInput'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { InventoryItem } from '@/types/inventory.types'
import type { z } from 'zod'

type StockOutFormData = z.infer<typeof stockOutSchema>

interface Props { item: InventoryItem; onSuccess?: () => void }

export default function StockOutForm({ item, onSuccess }: Props) {
  const { t } = useTranslation('inventory')
  const queryClient = useQueryClient()
  const { handleSubmit, setValue, watch, register } = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: StockOutFormData) =>
      inventoryApi.stockOut(item.id, {
        quantity: parseFloat(data.quantity),
        reason: data.reason,
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
        <QuantityInput value={watch('quantity')} onChange={(v) => setValue('quantity', v)} unit={item.unit.toLowerCase()} />
      </div>
      <div className="space-y-2">
        <Label>{t('reason')}</Label>
        <Input {...register('reason')} />
      </div>
      <div className="space-y-2">
        <Label>{t('common:labels.notes')}</Label>
        <Textarea {...register('notes')} rows={2} />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
        {t('stockOut')}
      </Button>
    </form>
  )
}
