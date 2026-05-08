import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PaymentMethodBadge } from '@/components/ui/PaymentMethodBadge'
import { formatDateTime } from '@/utils/date.util'
import type { Sale } from '@/types/sale.types'
import strawberryImg from '@/assets/IMG_6686.PNG'

interface Props {
  sale: Sale
  onClose: () => void
}

export default function SaleReceiptModal({ sale, onClose }: Props) {
  const { t, i18n } = useTranslation('sales')

  const handlePrint = () => window.print()

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>✅ {t('saleComplete')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="text-center border-b pb-3">
            <p className="font-bold text-lg flex items-center justify-center gap-2">
              <img src={strawberryImg} alt="" className="h-8 w-8 object-cover rounded-full border shadow-sm" />
              Choco Berry
            </p>
            <p className="text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
            <p className="text-muted-foreground">#{sale.saleNumber}</p>
          </div>

          <div className="space-y-1">
            {sale.items.map((item) => {
              const name = i18n.language === 'tg'
                ? item.product?.nameTg || 'Product'
                : item.product?.nameRu || 'Product'
              return (
                <div key={item.id} className="flex justify-between">
                  <span>{name} × {item.quantity}</span>
                  <MoneyDisplay amount={item.total} />
                </div>
              )
            })}
          </div>

          <div className="border-t pt-2 space-y-1">
            {parseFloat(sale.discount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t('discount')}</span>
                <MoneyDisplay amount={sale.discount} />
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>{t('total')}</span>
              <MoneyDisplay amount={sale.total} className="text-primary" />
            </div>
            <div className="flex justify-between items-center">
              <span>{t('paymentMethod')}</span>
              <PaymentMethodBadge method={sale.paymentMethod} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            🖨️ {t('common:actions.print')}
          </Button>
          <Button className="flex-1" onClick={onClose}>
            {t('newSaleButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
