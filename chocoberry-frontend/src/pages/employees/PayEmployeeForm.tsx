import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { employeesApi } from '@/api/employees.api'
import { payEmployeeSchema } from '@/utils/validation.util'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type PayFormData = z.infer<typeof payEmployeeSchema>

interface Props {
  employeeId: string
  employeeName: string
  onClose: () => void
  onSuccess: () => void
}

export default function PayEmployeeForm({ employeeId, employeeName, onClose, onSuccess }: Props) {
  const { t } = useTranslation('employees')

  const form = useForm<PayFormData>({
    resolver: zodResolver(payEmployeeSchema),
    defaultValues: {
      paymentType: 'SALARY',
      amount: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PayFormData) =>
      employeesApi.pay(employeeId, {
        paymentType: data.paymentType,
        amount: parseFloat(data.amount),
        period: data.period,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success(t('paySuccess'))
      onSuccess()
    },
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payEmployee')}: {employeeName}</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentType')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SALARY">{t('paymentTypes.SALARY')}</SelectItem>
                        <SelectItem value="ADVANCE">{t('paymentTypes.ADVANCE')}</SelectItem>
                        <SelectItem value="BONUS">{t('paymentTypes.BONUS')}</SelectItem>
                        <SelectItem value="LUNCH">{t('paymentTypes.LUNCH')}</SelectItem>
                        <SelectItem value="OWNER_DRAW">{t('paymentTypes.OWNER_DRAW')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('period')}</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder={t('notePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                {t('common:actions.cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? t('common:loading') : t('payNow')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
