import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { expensesApi } from '@/api/expenses.api'
import { expenseSchema } from '@/utils/validation.util'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type ExpenseFormData = z.infer<typeof expenseSchema>

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const EXPENSE_TYPES = ['FIXED', 'VARIABLE', 'PAYROLL', 'OWNER_DRAW', 'CONSUMABLE', 'WASTE'] as const

export default function ExpenseForm({ onClose, onSuccess }: Props) {
  const { t } = useTranslation('expenses')

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseType: 'VARIABLE',
      amount: '',
      description: '',
      paymentMethod: 'CASH',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ExpenseFormData) =>
      expensesApi.create({
        ...data,
        amount: parseFloat(data.amount),
      }),
    onSuccess: () => {
      toast.success(t('addSuccess'))
      onSuccess()
    },
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addExpense')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expenseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`types.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentMethod')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">{t('cash')}</SelectItem>
                        <SelectItem value="CARD">{t('card')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('date')}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vendor')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('vendorPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder={t('descriptionPlaceholder')} {...field} />
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
                {mutation.isPending ? t('common:loading') : t('common:actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
