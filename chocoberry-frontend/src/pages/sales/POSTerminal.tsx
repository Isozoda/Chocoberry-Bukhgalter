import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { salesApi } from '@/api/sales.api'
import { productsApi } from '@/api/products.api'
import { addMoney, multiplyMoney, toDecimal } from '@/utils/decimal.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import MixedPaymentModal from './MixedPaymentModal'
import SaleReceiptModal from './SaleReceiptModal'
import type { Product } from '@/types/product.types'
import type { Sale } from '@/types/sale.types'
import Decimal from 'decimal.js'

interface CartItem {
  product: Product
  quantity: number
}

export default function POSTerminal() {
  const { t, i18n } = useTranslation('sales')
  const queryClient = useQueryClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MIXED'>('CASH')
  const [mixedOpen, setMixedOpen] = useState(false)
  const [mixedCash, setMixedCash] = useState('0')
  const [mixedCard, setMixedCard] = useState('0')
  const [receipt, setReceipt] = useState<Sale | null>(null)
  const [cupType, setCupType] = useState('ALL')

  const { data: productsData } = useQuery({
    queryKey: ['products', { cupType: cupType === 'ALL' ? undefined : cupType, limit: 100 }],
    queryFn: () => productsApi.list({ cupType: cupType === 'ALL' ? undefined : cupType, limit: 100 }),
  })

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const subtotal = cart.reduce(
    (acc, item) => acc.plus(multiplyMoney(item.product.price, item.quantity)),
    new Decimal(0)
  )
  const discountAmount = toDecimal(discount || '0')
  const total = Decimal.max(new Decimal(0), subtotal.minus(discountAmount))

  const mixedValid =
    paymentMethod === 'MIXED'
      ? addMoney(mixedCash || '0', mixedCard || '0').equals(total)
      : true

  const saleMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: (data) => {
      setReceipt(data)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['cashbox'] })
    },
  })

  const handleSale = () => {
    if (cart.length === 0) {
      toast.error(t('emptyCart'))
      return
    }
    saleMutation.mutate({
      items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      paymentMethod,
      cashAmount: parseFloat(paymentMethod === 'MIXED' ? mixedCash : paymentMethod === 'CASH' ? total.toString() : '0'),
      cardAmount: parseFloat(paymentMethod === 'MIXED' ? mixedCard : paymentMethod === 'CARD' ? total.toString() : '0'),
      discount: parseFloat(discount || '0'),
    })
  }

  const handleNewSale = () => {
    setCart([])
    setDiscount('0')
    setPaymentMethod('CASH')
    setReceipt(null)
  }

  const cupTypes = ['ALL', 'CUP_300_ML', 'CUP_400_ML', 'CUP_80SM', 'CUP_90SM', 'CUP_ICE_CREAM', 'OTHER']

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product grid */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={cupType} onValueChange={setCupType}>
            <TabsList className="flex-wrap h-auto">
              {cupTypes.map((ct) => (
                <TabsTrigger key={ct} value={ct} className="text-xs">
                  {ct === 'ALL' ? 'All' : ct.replace(/_/g, ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {productsData?.data.map((product) => {
              const name = (i18n.language === 'tg' ? product.nameTg : product.nameRu) || product.name
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="text-2xl mb-1">🍓</div>
                  <p className="font-medium text-sm truncate">{name}</p>
                  <MoneyDisplay amount={product.price} className="text-xs text-primary font-bold" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Cart */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              {t('cart')} ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <EmptyState message={t('emptyCart')} className="py-6" />
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const name = (i18n.language === 'tg' ? item.product.nameTg : item.product.nameRu) || item.product.name
                  const lineTotal = multiplyMoney(item.product.price, item.quantity)
                  return (
                    <div key={item.product.id} className="flex items-center gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{name}</p>
                        <MoneyDisplay amount={lineTotal.toString()} className="text-xs text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQty(item.product.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center tabular-nums">{item.quantity}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQty(item.product.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <MoneyDisplay amount={subtotal.toString()} />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground min-w-0">{t('discount')}</Label>
                <MoneyInput value={discount} onChange={setDiscount} className="flex-1 text-sm h-7" />
              </div>

              <div className="flex justify-between font-bold text-base">
                <span>{t('total')}</span>
                <MoneyDisplay amount={total.toString()} className="text-primary text-lg" />
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label className="text-xs">{t('paymentMethod')}</Label>
              <div className="flex rounded-md border overflow-hidden">
                {(['CASH', 'CARD', 'MIXED'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setPaymentMethod(m)
                      if (m === 'MIXED') setMixedOpen(true)
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      paymentMethod === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    {t(`common:payment.${m.toLowerCase()}`)}
                  </button>
                ))}
              </div>

              {paymentMethod === 'MIXED' && (
                <div className="text-xs">
                  <span className={mixedValid ? 'text-green-600' : 'text-destructive'}>
                    {mixedValid ? '✓ ' : '⚠ '}
                    Cash: {mixedCash} + Card: {mixedCard}
                  </span>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSale}
              disabled={
                cart.length === 0 ||
                saleMutation.isPending ||
                (paymentMethod === 'MIXED' && !mixedValid)
              }
            >
              {saleMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
              {t('processSale')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <MixedPaymentModal
        open={mixedOpen}
        total={total.toString()}
        cashAmount={mixedCash}
        cardAmount={mixedCard}
        onCashChange={setMixedCash}
        onCardChange={setMixedCard}
        onClose={() => setMixedOpen(false)}
      />

      {receipt && (
        <SaleReceiptModal
          sale={receipt}
          onClose={handleNewSale}
        />
      )}
    </>
  )
}
