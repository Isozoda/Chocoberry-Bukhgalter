import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { fundsApi } from '@/api/funds.api'
import { fundTransactionSchema } from '@/utils/validation.util'
import type { FundTransactionDto, Fund } from '@/types/fund.types'
import toast from 'react-hot-toast'

interface FormData extends FundTransactionDto {
  fundId: string
}

interface Props {
  funds: Fund[]
  onClose: () => void
  onSuccess: () => void
}

export default function FundTransactionForm({ funds, onClose, onSuccess }: Props) {
  const { t } = useTranslation('funds')

  const form = useForm<FormData>({
    defaultValues: {
      fundId: funds[0]?.id ?? '',
      type: 'INCOME',
      amount: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: ({ fundId, ...dto }: FormData) => fundsApi.addTransaction(fundId, dto),
    onSuccess: () => {
      toast.success(t('transactionAdded'))
      onSuccess()
    },
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addTransaction')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="fundId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fund')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectFund')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {t(`types.${fund.name || fund.type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
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
                        <SelectItem value="INCOME">{t('txTypes.INCOME')}</SelectItem>
                        <SelectItem value="EXPENSE">{t('txTypes.EXPENSE')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
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

