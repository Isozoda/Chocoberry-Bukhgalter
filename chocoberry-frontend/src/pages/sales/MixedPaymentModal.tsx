import { useTranslation } from 'react-i18next'
import { addMoney, toDecimal } from '@/utils/decimal.util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  total: string
  cashAmount: string
  cardAmount: string
  onCashChange: (v: string) => void
  onCardChange: (v: string) => void
  onClose: () => void
}

export default function MixedPaymentModal({
  open,
  total,
  cashAmount,
  cardAmount,
  onCashChange,
  onCardChange,
  onClose,
}: Props) {
  const { t } = useTranslation('sales')

  const sum = addMoney(cashAmount || '0', cardAmount || '0')
  const isValid = sum.equals(toDecimal(total))
  const diff = sum.minus(toDecimal(total))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('mixedPayment')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <MoneyDisplay amount={total} className="font-bold text-primary" />
          </div>

          <div className="space-y-2">
            <Label>{t('cashAmount')}</Label>
            <MoneyInput value={cashAmount} onChange={onCashChange} />
          </div>

          <div className="space-y-2">
            <Label>{t('cardAmount')}</Label>
            <MoneyInput value={cardAmount} onChange={onCardChange} />
          </div>

          <div className={cn(
            'p-3 rounded-lg text-sm font-medium',
            isValid ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          )}>
            {isValid ? (
              `✓ ${t('common:toast.success')}`
            ) : (
              t('cashCardMustEqual', { total }) + ` (${diff.gt(0) ? '+' : ''}${diff.toFixed(2)} см)`
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button onClick={onClose} disabled={!isValid}>
            {t('common:actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
