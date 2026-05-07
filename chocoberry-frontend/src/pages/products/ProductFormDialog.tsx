import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { productsApi } from '@/api/products.api'
import { productSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MoneyInput } from '@/components/forms/MoneyInput'
import type { Product } from '@/types/product.types'
import type { z } from 'zod'

type ProductForm = z.infer<typeof productSchema>

interface Props {
  open: boolean
  product?: Product | null
  onClose: () => void
}

export default function ProductFormDialog({ open, product, onClose }: Props) {
  const { t } = useTranslation('products')
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { cupType: 'CUP_300_ML', isActive: true },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        nameTg: product.nameTg ?? undefined,
        nameRu: product.nameRu ?? undefined,
        cupType: product.cupType ?? undefined,
        price: product.price,
        isActive: product.isActive,
      })
    } else {
      reset({ name: '', nameTg: '', nameRu: '', cupType: 'CUP_300_ML', price: '', isActive: true })
    }
  }, [product, reset])

  const mutation = useMutation({
    mutationFn: (data: ProductForm) =>
      product ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('common:toast.saved'))
      onClose()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? t('editProduct') : t('addProduct')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('common:labels.name')} *</Label>
            <Input {...register('name')} placeholder="Product name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name (TG)</Label>
              <Input {...register('nameTg')} placeholder="Тоҷикӣ" />
            </div>
            <div className="space-y-2">
              <Label>Name (RU)</Label>
              <Input {...register('nameRu')} placeholder="Русский" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('cupType')}</Label>
            <Select value={watch('cupType')} onValueChange={(v) => setValue('cupType', v as 'CUP_300_ML')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CUP_300_ML">{t('cup300')}</SelectItem>
                <SelectItem value="CUP_400_ML">{t('cup400')}</SelectItem>
                <SelectItem value="CUP_80SM">{t('cup80')}</SelectItem>
                <SelectItem value="CUP_90SM">{t('cup90')}</SelectItem>
                <SelectItem value="CUP_ICE_CREAM">{t('iceCream')}</SelectItem>
                <SelectItem value="OTHER">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('common:labels.price')} *</Label>
            <MoneyInput value={watch('price')} onChange={(v) => setValue('price', v)} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
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
