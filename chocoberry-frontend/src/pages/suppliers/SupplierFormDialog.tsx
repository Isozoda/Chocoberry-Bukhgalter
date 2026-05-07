import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { suppliersApi } from '@/api/suppliers.api'
import { supplierSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Supplier } from '@/types/supplier.types'
import type { z } from 'zod'

type SupplierForm = z.infer<typeof supplierSchema>

interface Props {
  open: boolean
  supplier?: Supplier | null
  onClose: () => void
}

export default function SupplierFormDialog({ open, supplier, onClose }: Props) {
  const { t } = useTranslation('suppliers')
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { isActive: true },
  })

  useEffect(() => {
    if (supplier) {
      reset({ name: supplier.name, type: supplier.type, phone: supplier.phone || '', isActive: supplier.isActive })
    } else {
      reset({ name: '', type: 'FRUIT', phone: '', isActive: true })
    }
  }, [supplier, reset])

  const mutation = useMutation({
    mutationFn: (data: SupplierForm) =>
      supplier ? suppliersApi.update(supplier.id, data) : suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success(t('common:toast.saved'))
      onClose()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? t('editSupplier') : t('addSupplier')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('common:labels.name')} *</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('common:labels.type')}</Label>
            <Select value={watch('type')} onValueChange={(v) => setValue('type', v as 'FRUIT')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FRUIT">{t('fruit')}</SelectItem>
                <SelectItem value="CHOCOLATE">{t('chocolate')}</SelectItem>
                <SelectItem value="PACKAGING">{t('packaging')}</SelectItem>
                <SelectItem value="OTHER">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('phone')}</Label>
            <Input {...register('phone')} placeholder="+992..." />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(v) => setValue('isActive', v)}
            />
            <Label>{t('active')}</Label>
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
