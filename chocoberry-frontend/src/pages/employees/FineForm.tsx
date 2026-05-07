import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { employeesApi } from '@/api/employees.api'
import { fineSchema } from '@/utils/validation.util'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type FineFormData = z.infer<typeof fineSchema>

interface Props {
  employeeId: string
  employeeName: string
  onClose: () => void
  onSuccess: () => void
}

export default function FineForm({ employeeId, employeeName, onClose, onSuccess }: Props) {
  const { t } = useTranslation('employees')

  const form = useForm<FineFormData>({
    resolver: zodResolver(fineSchema),
    defaultValues: {
      amount: '',
      reason: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FineFormData) =>
      employeesApi.createFine(employeeId, {
        amount: parseFloat(data.amount),
        reason: data.reason,
      }),
    onSuccess: () => {
      toast.success(t('fineAdded'))
      onSuccess()
    },
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addFine')}: {employeeName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reason')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder={t('reasonPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                {t('common:actions.cancel')}
              </Button>
              <Button type="submit" variant="destructive" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? t('common:loading') : t('addFine')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
