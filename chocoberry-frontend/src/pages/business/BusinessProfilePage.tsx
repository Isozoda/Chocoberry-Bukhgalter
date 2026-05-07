import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { businessApi } from '@/api/business.api'
import { businessSetupSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useEffect } from 'react'
import type { z } from 'zod'

type ProfileForm = z.infer<typeof businessSetupSchema>

export default function BusinessProfilePage() {
  const { t } = useTranslation('business')
  const queryClient = useQueryClient()

  const { data: business, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.get,
  })

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    resolver: zodResolver(businessSetupSchema),
  })

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        type: business.type,
        address: business.address || '',
        phone: business.phone || '',
        bonusPercent: business.bonusPercent,
      })
    }
  }, [business, reset])

  const updateMutation = useMutation({
    mutationFn: businessApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
      toast.success(t('saveProfile'))
    },
  })

  if (isLoading) return <FullPageSpinner />

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t('profile')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('editProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('businessName')}</Label>
              <Input {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label>{t('address')}</Label>
              <Input {...register('address')} />
            </div>
            <div className="space-y-2">
              <Label>{t('phone')}</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>{t('bonusPercent')} (%)</Label>
              <Input type="number" step="0.1" {...register('bonusPercent')} />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
              {t('saveProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}
