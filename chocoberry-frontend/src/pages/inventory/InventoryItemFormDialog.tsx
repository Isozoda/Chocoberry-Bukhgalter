import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/api/inventory.api'
import { inventoryItemSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { z } from 'zod'

type ItemForm = z.infer<typeof inventoryItemSchema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function InventoryItemFormDialog({ open, onClose }: Props) {
  const { t } = useTranslation('inventory')
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ItemForm>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: { category: 'FRUIT', unit: 'KG' },
  })

  const mutation = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('common:toast.saved'))
      reset()
      onClose()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addItem')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('common:labels.name')} *</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v as 'FRUIT')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRUIT">{t('fruits')}</SelectItem>
                  <SelectItem value="CHOCOLATE">{t('chocolate')}</SelectItem>
                  <SelectItem value="PACKAGING">{t('packaging')}</SelectItem>
                  <SelectItem value="OTHER">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common:labels.unit')}</Label>
              <Select value={watch('unit')} onValueChange={(v) => setValue('unit', v as 'KG')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK'].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('minStock')} *</Label>
              <Input type="number" step="0.01" {...register('minStockLevel')} />
              {errors.minStockLevel && <p className="text-xs text-destructive">{errors.minStockLevel.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Cleaning Loss %</Label>
              <Input type="number" step="0.1" {...register('cleaningLossPct')} placeholder="0" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
              {t('common:actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
