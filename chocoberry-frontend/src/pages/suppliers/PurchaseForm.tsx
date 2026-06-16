import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Banknote, CreditCard, Building2, CheckCircle2 } from 'lucide-react'
import { suppliersApi } from '@/api/suppliers.api'
import { inventoryApi } from '@/api/inventory.api'
import { supplierPurchaseSchema } from '@/utils/validation.util'
import { multiplyMoney, toDecimal } from '@/utils/decimal.util'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { QuantityInput } from '@/components/forms/QuantityInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Card, CardContent } from '@/components/ui/card'
import type { Supplier, PurchaseForecast } from '@/types/supplier.types'
import type { z } from 'zod'

type PurchaseFormData = z.infer<typeof supplierPurchaseSchema>

const UNITS = ['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'BOX', 'PACK', 'BLOCK', 'DOZEN', 'TON']

interface Props {
  supplier: Supplier
  onSuccess?: () => void
}

export default function PurchaseForm({ supplier, onSuccess }: Props) {
  const { t } = useTranslation('suppliers')
  const queryClient = useQueryClient()
  const [forecast, setForecast] = useState<PurchaseForecast | null>(null)
  const [unit, setUnit] = useState<string>('KG')
  const [quantity, setQuantity] = useState('')
  const [boxCount, setBoxCount] = useState('')
  const [kgPerBox, setKgPerBox] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [inventoryItemId, setInventoryItemId] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
  const [cardType, setCardType] = useState<'DUSHANBE_CITY' | 'ALIF' | null>(null)

  const { data: inventoryList } = useQuery({
    queryKey: ['inventory', { limit: 100 }],
    queryFn: () => inventoryApi.list({ limit: 100 }),
  })

  const isBoxUnit = unit === 'BOX'
  const totalQty = isBoxUnit
    ? (boxCount && kgPerBox ? multiplyMoney(boxCount, kgPerBox).toString() : '0')
    : quantity
  const totalAmount = pricePerUnit && totalQty !== '0'
    ? multiplyMoney(totalQty, pricePerUnit).toString()
    : '0'

  const purchaseMutation = useMutation({
    mutationFn: (data: PurchaseFormData) => suppliersApi.purchase(supplier.id, data),
    onSuccess: (data) => {
      setForecast(data)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', supplier.id, 'purchases'] })
      toast.success(t('common:toast.saved'))
    },
  })

  const cardTypeRequired = paymentMethod === 'CARD'
  const canSubmit = !cardTypeRequired || cardType !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventoryItemId || !pricePerUnit) {
      toast.error(t('common:errors.required'))
      return
    }
    if (cardTypeRequired && !cardType) {
      toast.error(t('common:errors.required'))
      return
    }
    purchaseMutation.mutate({
      inventoryItemId,
      unit: unit as 'KG',
      quantity: isBoxUnit ? totalQty : quantity,
      boxCount: isBoxUnit ? parseInt(boxCount) : undefined,
      kgPerBox: isBoxUnit ? kgPerBox : undefined,
      pricePerUnit,
      notes: notes || undefined,
      paymentMethod,
      cardType: cardType ?? undefined,
    })
  }

  if (forecast) {
    return (
      <div className="mt-6 space-y-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3">✅ Purchase Recorded!</h3>
            <div className="space-y-1 text-sm">
              <p>{t('total')}: <MoneyDisplay amount={forecast.purchase.totalAmount} /></p>
              {forecast.forecastCupsBy03 && (
                <p>🧁 {t('forecastCups', { count: forecast.forecastCupsBy03, ml: '300' })}</p>
              )}
              {forecast.forecastCupsBy04 && (
                <p>🧁 {t('forecastCups', { count: forecast.forecastCupsBy04, ml: '400' })}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full" onClick={() => { setForecast(null); onSuccess?.() }}>
          {t('common:actions.close')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label>{t('common:labels.name')} *</Label>
        <Select value={inventoryItemId} onValueChange={setInventoryItemId}>
          <SelectTrigger>
            <SelectValue placeholder="Select inventory item..." />
          </SelectTrigger>
          <SelectContent>
            {inventoryList?.data.map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('common:labels.unit')}</Label>
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isBoxUnit ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t('boxCount')}</Label>
            <QuantityInput value={boxCount} onChange={setBoxCount} />
          </div>
          <div className="space-y-2">
            <Label>{t('kgPerBox')}</Label>
            <QuantityInput value={kgPerBox} onChange={setKgPerBox} unit="kg" />
          </div>
          {boxCount && kgPerBox && (
            <p className="col-span-2 text-sm text-muted-foreground">
              {t('boxToKgCalc', { boxes: boxCount, kg: kgPerBox, total: totalQty })}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>{t('common:labels.quantity')}</Label>
          <QuantityInput value={quantity} onChange={setQuantity} unit={unit.toLowerCase()} />
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('common:labels.price')} / {unit.toLowerCase()} *</Label>
        <MoneyInput value={pricePerUnit} onChange={setPricePerUnit} />
      </div>

      {totalAmount !== '0' && (
        <div className="p-3 bg-muted rounded-lg text-sm flex justify-between">
          <span>{t('common:labels.total')}:</span>
          <MoneyDisplay amount={totalAmount} className="font-bold text-primary" />
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('common:payment.payment')}</Label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'CASH' as const, label: t('common:payment.cash'), icon: Banknote },
            { key: 'CARD' as const, label: t('common:payment.card'), icon: CreditCard },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setPaymentMethod(key); if (key === 'CASH') setCardType(null) }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                paymentMethod === key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {cardTypeRequired && (
        <div className="space-y-2">
          <Label>Навъи корта *</Label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'DUSHANBE_CITY' as const, label: 'DC', icon: Building2 },
              { key: 'ALIF' as const, label: 'Алиф', icon: CreditCard },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCardType(key)}
                className={`relative flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  cardType === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {cardType === key && <CheckCircle2 className="absolute top-1 right-1 h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('common:labels.notes')}</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <Button type="submit" className="w-full" disabled={purchaseMutation.isPending || !canSubmit}>
        {purchaseMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
        {t('purchase')}
      </Button>
    </form>
  )
}
