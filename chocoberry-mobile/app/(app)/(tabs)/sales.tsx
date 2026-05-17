import React, { useState, useRef } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../../src/theme'
import { useCartStore } from '../../../src/store/cart.store'
import { productsApi } from '../../../src/api/products.api'
import { salesApi } from '../../../src/api/sales.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { FilterChips } from '../../../src/components/ui/FilterChips'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { QuantityInput } from '../../../src/components/forms/QuantityInput'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import { formatMoney, addMoney, toDecimal } from '../../../src/utils/decimal.util'
import Decimal from 'decimal.js'
import type { Product } from '../../../src/types/product.types'
import type { PaymentMethod } from '../../../src/types/sale.types'

const TYPE_CHIPS = [
  { key: 'ALL', label: 'Ҳама' },
  { key: 'CUP_03', label: '0.3ml' },
  { key: 'CUP_04', label: '0.4ml' },
  { key: 'PRICE_80', label: '80см' },
  { key: 'PRICE_90', label: '90см' },
  { key: 'ICE_CREAM', label: 'Мороженое' },
]

type TabType = 'terminal' | 'history'

export default function SalesScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabType>('terminal')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showCart, setShowCart] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [cashAmount, setCashAmount] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [discount, setDiscount] = useState('0')
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)

  const { items, addItem, updateQty, removeItem, clear, total } = useCartStore()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  })

  const { data: historyData } = useQuery({
    queryKey: ['sales', tab],
    queryFn: () => salesApi.list({ limit: 20, page: 1 }),
    enabled: tab === 'history',
  })

  const createSale = useMutation({
    mutationFn: salesApi.create,
    onSuccess: (sale) => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['sales-today'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setLastSale(sale)
      setShowCart(false)
      setShowReceipt(true)
      clear()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.saleCreated') })
    },
  })

  const products = productsData?.items ?? []
  const filtered = typeFilter === 'ALL' ? products : products.filter((p) => p.type === typeFilter)
  const cartTotal = total()

  const isMixedValid = paymentMethod !== 'MIXED' ||
    (cashAmount && cardAmount &&
      addMoney(cashAmount || '0', cardAmount || '0').equals(
        cartTotal.minus(toDecimal(discount || '0'))
      ))

  const handleCheckout = async () => {
    if (items.length === 0) return
    const finalTotal = cartTotal.minus(toDecimal(discount || '0'))

    await createSale.mutateAsync({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      paymentMethod,
      cashAmount: paymentMethod === 'CASH' ? finalTotal.toString() : (cashAmount || '0'),
      cardAmount: paymentMethod === 'CARD' ? finalTotal.toString() : (cardAmount || '0'),
      discount: discount || '0',
    })
  }

  const { isError: productsError, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  })

  const { isError: historyError, refetch: refetchHistory } = useQuery({
    queryKey: ['sales', tab],
    queryFn: () => salesApi.list({ limit: 20, page: 1 }),
    enabled: tab === 'history',
  })

  const renderProductItem = React.useCallback(({ item: product }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        addItem({ productId: product.id, name: product.name, price: product.price })
      }}
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>{product.name}</Text>
      <MoneyText amount={product.price} size={fontSize.md} bold color={colors.brand} />
      <Text style={[styles.costText, { color: colors.textSecondary }]}>
        {t('labels.cost')}: {formatMoney(product.costPrice)}
      </Text>
    </TouchableOpacity>
  ), [colors, t, addItem])

  const renderHistoryItem = React.useCallback(({ item: sale }: { item: any }) => (
    <View style={[styles.saleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.saleNum, { color: colors.textPrimary }]}>#{sale.saleNumber}</Text>
        <Text style={[styles.saleTime, { color: colors.textSecondary }]}>
          {new Date(sale.createdAt).toLocaleTimeString()}
        </Text>
      </View>
      <MoneyText amount={sale.total} bold />
      <Text style={[styles.payBadge, { color: colors.textSecondary }]}>{sale.paymentMethod}</Text>
    </View>
  ), [colors])

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      {/* Tab Header */}
      <View style={[styles.tabHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['terminal', 'history'] as TabType[]).map((t_) => (
          <TouchableOpacity
            key={t_}
            onPress={() => setTab(t_)}
            style={[styles.tabBtn, { borderBottomColor: tab === t_ ? colors.brand : 'transparent' }]}
          >
            <Text style={[styles.tabLabel, { color: tab === t_ ? colors.brand : colors.textSecondary }]}>
              {t_ === 'terminal' ? t('sales.terminal') : t('sales.history')}
            </Text>
          </TouchableOpacity>
        ))}

        {tab === 'terminal' && items.length > 0 && (
          <TouchableOpacity onPress={() => setShowCart(true)} style={styles.cartBtn}>
            <Ionicons name="cart" size={22} color={colors.brand} />
            <View style={[styles.cartBadge, { backgroundColor: colors.brand }]}>
              <Text style={styles.cartBadgeText}>{items.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {tab === 'terminal' ? (
        <>
          <FilterChips chips={TYPE_CHIPS} selected={typeFilter} onSelect={setTypeFilter} />
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productGrid}
            columnWrapperStyle={{ gap: spacing[3] }}
            ListEmptyComponent={
              productsError ? (
                <EmptyState message={t('errors.fetchFailed')} icon="alert-circle-outline" onRetry={refetchProducts} retryLabel={t('actions.retry')} />
              ) : (
                <EmptyState message={t('empty.noProducts')} />
              )
            }
            renderItem={renderProductItem}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </>
      ) : (
        <FlatList
          data={historyData?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            historyError ? (
              <EmptyState message={t('errors.fetchFailed')} icon="alert-circle-outline" onRetry={refetchHistory} retryLabel={t('actions.retry')} />
            ) : (
              <EmptyState message={t('empty.noSales')} />
            )
          }
          renderItem={renderHistoryItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" onRequestClose={() => setShowCart(false)}>
        <ScreenWrapper>
          <View style={[styles.cartHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.cartTitle, { color: colors.textPrimary }]}>{t('sales.cart')}</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {items.map((item) => (
              <View key={item.productId} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.cartItemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                <QuantityInput
                  value={item.quantity}
                  onChange={(q) => updateQty(item.productId, q)}
                  min={0}
                />
                <MoneyText amount={new Decimal(item.price).times(item.quantity)} bold />
              </View>
            ))}

            {/* Payment method */}
            <View style={styles.paySection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('sales.checkout')}</Text>
              <View style={styles.payBtns}>
                {(['CASH', 'CARD', 'MIXED'] as PaymentMethod[]).map((pm) => (
                  <TouchableOpacity
                    key={pm}
                    onPress={() => setPaymentMethod(pm)}
                    style={[
                      styles.payMethodBtn,
                      {
                        backgroundColor: paymentMethod === pm ? colors.brand : colors.surfaceAlt,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text style={{ color: paymentMethod === pm ? '#fff' : colors.textSecondary, fontWeight: fontWeight.semibold }}>
                      {t(`payment.${pm.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {paymentMethod === 'MIXED' && (
                <View style={styles.mixedInputs}>
                  <MoneyInput
                    label={t('sales.cashAmount')}
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    placeholder="0"
                  />
                  <MoneyInput
                    label={t('sales.cardAmount')}
                    value={cardAmount}
                    onChangeText={setCardAmount}
                    placeholder="0"
                  />
                  <Text style={[
                    styles.mixedValidation,
                    { color: isMixedValid ? colors.green : colors.red },
                  ]}>
                    {isMixedValid ? '✓ Маблағ дуруст аст' : `✗ Ҷамъ бояд: ${formatMoney(cartTotal)}`}
                  </Text>
                </View>
              )}

              <MoneyInput
                label={t('sales.discount')}
                value={discount}
                onChangeText={setDiscount}
                placeholder="0"
              />
            </View>

            {/* Total Summary */}
            <View style={[styles.summary, { backgroundColor: colors.surfaceAlt }]}>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textSecondary }}>{t('sales.subtotal')}</Text>
                <MoneyText amount={cartTotal} />
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textSecondary }}>{t('sales.discount')}</Text>
                <MoneyText amount={discount || '0'} color={colors.red} />
              </View>
              <View style={styles.summaryRow}>
                <Text style={[{ color: colors.textPrimary, fontWeight: fontWeight.bold }]}>{t('sales.grandTotal')}</Text>
                <MoneyText amount={cartTotal.minus(toDecimal(discount || '0'))} bold color={colors.brand} size={fontSize.xl} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutBtnWrap}>
            <TouchableOpacity
              onPress={handleCheckout}
              disabled={!isMixedValid || createSale.isPending}
              style={[
                styles.checkoutBtn,
                {
                  backgroundColor: isMixedValid ? colors.brand : colors.textTertiary,
                  borderRadius: radius.lg,
                  opacity: createSale.isPending ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.checkoutBtnText, { color: '#fff' }]}>
                {createSale.isPending ? '...' : t('sales.payNow')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenWrapper>
      </Modal>

      {/* Receipt Modal */}
      <Modal visible={showReceipt} animationType="fade" onRequestClose={() => setShowReceipt(false)}>
        <View style={[styles.receiptContainer, { backgroundColor: colors.background }]}>
          <Text style={styles.receiptLogo}>🍓</Text>
          <Text style={[styles.receiptTitle, { color: colors.brand }]}>Choco Berry</Text>
          {lastSale && (
            <>
              <Text style={[styles.receiptNum, { color: colors.textSecondary }]}>#{lastSale.saleNumber}</Text>
              <Text style={[styles.receiptDate, { color: colors.textSecondary }]}>
                {new Date(lastSale.createdAt).toLocaleString()}
              </Text>
              <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
              {lastSale.items?.map((item: any) => (
                <View key={item.id} style={styles.receiptItem}>
                  <Text style={{ color: colors.textPrimary, flex: 1 }}>{item.product?.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>{item.quantity}x</Text>
                  <MoneyText amount={item.totalPrice} />
                </View>
              ))}
              <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
              <View style={styles.receiptTotal}>
                <Text style={[styles.receiptTotalLabel, { color: colors.textPrimary }]}>{t('labels.total')}</Text>
                <MoneyText amount={lastSale.total} bold size={fontSize.xl} color={colors.brand} />
              </View>
            </>
          )}
          <TouchableOpacity
            onPress={() => { setShowReceipt(false); }}
            style={[styles.newSaleBtn, { backgroundColor: colors.brand, borderRadius: radius.lg }]}
          >
            <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
              {t('sales.newSale')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  tabHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: spacing[4] },
  tabBtn: { paddingVertical: 14, paddingHorizontal: spacing[4], borderBottomWidth: 2 },
  tabLabel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  cartBtn: { marginLeft: 'auto', padding: spacing[2], position: 'relative' },
  cartBadge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: fontWeight.bold },
  productGrid: { padding: spacing[4], gap: spacing[3] },
  productCard: { flex: 1, padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[2] },
  productName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 },
  costText: { fontSize: fontSize.xs },
  list: { padding: spacing[4], gap: spacing[3] },
  saleRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[3] },
  saleNum: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  saleTime: { fontSize: fontSize.xs },
  payBadge: { fontSize: fontSize.xs },
  cartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  cartTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderBottomWidth: 1, gap: spacing[3] },
  cartItemName: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  paySection: { padding: spacing[4], gap: spacing[4] },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  payBtns: { flexDirection: 'row', gap: spacing[2] },
  payMethodBtn: { flex: 1, padding: spacing[3], alignItems: 'center' },
  mixedInputs: { gap: spacing[3] },
  mixedValidation: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  summary: { margin: spacing[4], padding: spacing[4], borderRadius: radius.lg, gap: spacing[2] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkoutBtnWrap: { padding: spacing[4] },
  checkoutBtn: { padding: spacing[4], alignItems: 'center' },
  checkoutBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  receiptContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], gap: spacing[4] },
  receiptLogo: { fontSize: 64 },
  receiptTitle: { fontSize: 32, fontWeight: fontWeight.extrabold },
  receiptNum: { fontSize: fontSize.md },
  receiptDate: { fontSize: fontSize.sm },
  receiptDivider: { width: '100%', height: 1, marginVertical: spacing[2] },
  receiptItem: { flexDirection: 'row', gap: spacing[3], width: '100%' },
  receiptTotal: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  receiptTotalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  newSaleBtn: { padding: spacing[4], paddingHorizontal: spacing[8], marginTop: spacing[4] },
})
