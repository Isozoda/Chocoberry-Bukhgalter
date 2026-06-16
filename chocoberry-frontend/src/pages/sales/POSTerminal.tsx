import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Minus, Trash2, ShoppingBag, Banknote, CreditCard, Shuffle, Tag, CheckCircle2, ChevronRight, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { salesApi } from '@/api/sales.api'
import { productsApi } from '@/api/products.api'
import { addMoney, multiplyMoney, toDecimal } from '@/utils/decimal.util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import SaleReceiptModal from './SaleReceiptModal'
import type { Product } from '@/types/product.types'
import type { CardType, Sale } from '@/types/sale.types'
import Decimal from 'decimal.js'
import strawberryImg from '@/assets/IMG_6686.PNG'

interface CartItem {
  product: Product
  quantity: number
}

const CUP_LABELS: Record<string, string> = {
  ALL: 'Ҳама',
  CUP_300_ML: '300 мл',
  CUP_400_ML: '400 мл',
  CUP_80SM: '80 см',
  CUP_90SM: '90 см',
  CUP_ICE_CREAM: 'Мороженое',
  OTHER: 'Дигар',
}

const cupTypes = ['ALL', 'CUP_300_ML', 'CUP_400_ML', 'CUP_80SM', 'CUP_90SM', 'CUP_ICE_CREAM', 'OTHER']

export default function POSTerminal() {
  const { t, i18n } = useTranslation('sales')
  const queryClient = useQueryClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MIXED'>('CASH')
  const [mixedCash, setMixedCash] = useState('0')
  const [mixedCard, setMixedCard] = useState('0')
  const [cardType, setCardType] = useState<CardType | null>(null)
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

  const cardTypeRequired = paymentMethod === 'CARD' || paymentMethod === 'MIXED'
  const canSubmit = cart.length > 0 && !saleMutation.isPending &&
    (paymentMethod === 'MIXED' ? mixedValid : true) &&
    (cardTypeRequired ? cardType !== null : true)

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
      cardType: cardType ?? undefined,
      discount: parseFloat(discount || '0'),
    })
  }

  const handleNewSale = () => {
    setCart([])
    setDiscount('0')
    setPaymentMethod('CASH')
    setCardType(null)
    setReceipt(null)
  }

  const paymentOptions = [
    { key: 'CASH' as const, label: 'Нақд', icon: Banknote },
    { key: 'CARD' as const, label: 'Карта', icon: CreditCard },
    { key: 'MIXED' as const, label: 'Омехта', icon: Shuffle },
  ]

  return (
    <>
      <div className="flex gap-5 h-[calc(100vh-var(--pos-h-offset,160px))] min-h-0">

        {/* ═══ LEFT — Product grid ═══ */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {cupTypes.map((ct) => (
              <button
                key={ct}
                onClick={() => setCupType(ct)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  cupType === ct
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {CUP_LABELS[ct]}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {productsData?.data.map((product) => {
                const name = (i18n.language === 'tg' ? product.nameTg : product.nameRu) || product.name
                const inCart = cart.find((i) => i.product.id === product.id)
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                      inCart
                        ? 'border-primary shadow-md shadow-primary/20'
                        : 'border-border hover:border-primary/60'
                    }`}
                  >
                    {/* Cart badge */}
                    {inCart && (
                      <span className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        {inCart.quantity}
                      </span>
                    )}

                    {/* Image */}
                    <div className="h-28 w-full overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20">
                      <img
                        src={strawberryImg}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-semibold text-sm leading-tight truncate mb-1">{name}</p>
                      <MoneyDisplay amount={product.price} className="text-sm text-primary font-bold" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT — Cart panel ═══ */}
        <div className="w-[480px] flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm">

          {/* Cart header */}
          <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-base">{t('cart')}</span>
            </div>
            {cart.length > 0 && (
              <span className="text-xs bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} та
              </span>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground py-10">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 opacity-40" />
                </div>
                <p className="text-sm">{t('emptyCart')}</p>
              </div>
            ) : (
              cart.map((item) => {
                const name = (i18n.language === 'tg' ? item.product.nameTg : item.product.nameRu) || item.product.name
                const lineTotal = multiplyMoney(item.product.price, item.quantity)
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20">
                      <img src={strawberryImg} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{name}</p>
                      <MoneyDisplay amount={lineTotal.toString()} className="text-xs text-primary font-bold" />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-full bg-background border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-full bg-background border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Summary + payment */}
          <div className="border-t px-4 pt-4 pb-4 space-y-4 bg-muted/10">

            {/* Subtotal & discount */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('subtotal')}</span>
                <MoneyDisplay amount={subtotal.toString()} />
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <Label className="text-xs text-muted-foreground">{t('discount')}</Label>
                <MoneyInput value={discount} onChange={setDiscount} className="flex-1 h-7 text-xs" />
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-primary/8 dark:bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <span className="font-bold text-base">{t('total')}</span>
              <MoneyDisplay amount={total.toString()} className="text-2xl font-black text-primary" />
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setPaymentMethod(key)
                    if (key === 'MIXED') {
                      setMixedCash('0')
                      setMixedCard(total.toFixed(2))
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                    paymentMethod === key
                      ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Card type selection */}
            {cardTypeRequired && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Навъи карта интихоб кунед
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'DUSHANBE_CITY' as CardType, label: 'Душанбе Сити', icon: Building2, color: 'from-blue-500 to-blue-600' },
                    { key: 'ALIF' as CardType, label: 'Алиф', icon: CreditCard, color: 'from-emerald-500 to-emerald-600' },
                  ]).map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setCardType(key)}
                      className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 overflow-hidden ${
                        cardType === key
                          ? 'border-transparent text-white shadow-lg scale-[1.02]'
                          : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground bg-background'
                      }`}
                    >
                      {cardType === key && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
                      )}
                      <Icon className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">{label}</span>
                      {cardType === key && (
                        <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 z-10" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mixed inputs */}
            {paymentMethod === 'MIXED' && (
              <div className="space-y-2 p-3 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <Label className="text-xs text-muted-foreground w-14">Нақд</Label>
                  <MoneyInput
                    value={mixedCash}
                    onChange={(v) => {
                      setMixedCash(v)
                      const cash = new Decimal(v || '0')
                      setMixedCard(Decimal.max(new Decimal(0), total.minus(cash)).toFixed(2))
                    }}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <Label className="text-xs text-muted-foreground w-14">Карта</Label>
                  <MoneyInput
                    value={mixedCard}
                    onChange={(v) => {
                      setMixedCard(v)
                      const card = new Decimal(v || '0')
                      setMixedCash(Decimal.max(new Decimal(0), total.minus(card)).toFixed(2))
                    }}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg ${
                  mixedValid
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 ${mixedValid ? '' : 'opacity-40'}`} />
                  {mixedValid ? `Дуруст: ${total.toFixed(2)} см` : `Ҷамъ бояд ${total.toFixed(2)} см бошад`}
                </div>
              </div>
            )}

            {/* Execute button */}
            <button
              onClick={handleSale}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
            >
              {saleMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {cardTypeRequired && !cardType ? 'Навъи картаро интихоб кунед' : t('processSale')}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {receipt && (
        <SaleReceiptModal sale={receipt} onClose={handleNewSale} />
      )}
    </>
  )
}
