import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ImagePlus, X } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { productSchema } from '@/utils/validation.util'
import { getImageUrl } from '@/utils/image.util'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { cupType: 'CUP_300_ML', isActive: true },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        cupType: product.cupType ?? undefined,
        price: product.price,
        isActive: product.isActive,
      })
      setImagePreview(getImageUrl(product.imageUrl))
    } else {
      reset({ name: '', cupType: 'CUP_300_ML', price: '', isActive: true })
      setImagePreview(undefined)
    }
    setImageFile(null)
  }, [product, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const mutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const saved = product ? await productsApi.update(product.id, data) : await productsApi.create(data)
      if (imageFile) {
        await productsApi.uploadImage(saved.id, imageFile)
      }
      return saved
    },
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
            <Label>{t('photo')}</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-20 w-20 rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors flex-shrink-0"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6" />
                )}
              </button>
              <div className="flex flex-col gap-1">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {t('uploadPhoto')}
                </Button>
                {imagePreview && (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive justify-start" onClick={clearImage}>
                    <X className="h-3 w-3 mr-1" /> {t('removePhoto')}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('common:labels.name')} *</Label>
            <Input {...register('name')} placeholder="Product name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
