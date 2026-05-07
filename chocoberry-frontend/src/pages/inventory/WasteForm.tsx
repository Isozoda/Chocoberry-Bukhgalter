import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/api/inventory.api'
import { wasteSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuantityInput } from '@/components/forms/QuantityInput'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { InventoryItem } from '@/types/inventory.types'
import type { z } from 'zod'

type WasteFormData = z.infer<typeof wasteSchema>

interface Props { item: InventoryItem; onSuccess?: () => void }

export default function WasteForm({ item, onSuccess }: Props) {
  const { t } = useTranslation('inventory')
  const queryClient = useQueryClient()
  const { handleSubmit, setValue, watch, register, formState: { errors } } = useForm<WasteFormData>({
    resolver: zodResolver(wasteSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: WasteFormData) =>
      inventoryApi.waste(item.id, {
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
        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t('reason')} *</Label>
        <Input {...register('reason')} />
        {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t('common:labels.notes')}</Label>
        <Textarea {...register('notes')} rows={2} />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
        {t('waste')}
      </Button>
    </form>
  )
}
