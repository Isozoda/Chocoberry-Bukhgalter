import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput as RNTextInput,
  ScrollView, Modal, Alert, RefreshControl,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { productsApi } from '../../api/products.api'
import { salesApi } from '../../api/sales.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { formatMoney, toDecimal, multiplyMoney, addMoney } from '../../utils/decimal.util'
import { formatDateTime } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { Product } from '../../types/product.types'
import type { Sale, CreateSaleDto, PaymentMethod } from '../../types/sale.types'

interface CartItem { product: Product; qty: number }

const PAY_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'CASH', label: 'Нақд', icon: 'cash-outline' },
  { key: 'CARD', label: 'Корт', icon: 'card-outline' },
  { key: 'TRANSFER', label: 'Ҳавола', icon: 'swap-horizontal-outline' },
  { key: 'MIXED', label: 'Омехта', icon: 'layers-outline' },
]

function POSTab() {
  const queryClient = useQueryClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')
  const [discount, setDiscount] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [successSale, setSuccessSale] = useState<Sale | null>(null)

  const { data: products } = useQuery({
    queryKey: ['products', 'list', { limit: 100 }],
    queryFn: () => productsApi.list({ limit: 100 }),
  })

  const filtered = (products?.data ?? []).filter(
    (p) => p.isActive && (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id)
      if (existing) return prev.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { product, qty: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === productId)
      if (!existing) return prev
      if (existing.qty === 1) return prev.filter((c) => c.product.id !== productId)
      return prev.map((c) => c.product.id === productId ? { ...c, qty: c.qty - 1 } : c)
    })
  }

  const subtotal = cart.reduce((acc, c) => addMoney(acc, multiplyMoney(c.product.price, c.qty)), toDecimal(0))
  const discountAmt = toDecimal(discount || '0')
  const total = subtotal.minus(discountAmt)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const createSale = useMutation({
    mutationFn: (dto: CreateSaleDto) => salesApi.create(dto),
    onSuccess: (sale) => {
      setSuccessSale(sale)
      setCart([])
      setDiscount('')
      setCartOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['cashbox'] })
    },
  })

  const handleCheckout = () => {
    if (cart.length === 0) return
    const dto: CreateSaleDto = {
      items: cart.map((c) => ({ productId: c.product.id, quantity: c.qty, unitPrice: Number(c.product.price) })),
      paymentMethod: payMethod,
      discount: Number(discount || 0),
      ...(payMethod === 'MIXED' ? {
        cashAmount: Number(cashAmount || 0),
        cardAmount: total.minus(toDecimal(cashAmount || '0')).toNumber(),
      } : {}),
    }
    createSale.mutate(dto)
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
        <RNTextInput
          style={styles.searchInput} placeholder="Маҳсулотро ҷустуҷӯ кунед..."
          placeholderTextColor={Colors.textTertiary} value={search}
          onChangeText={setSearch} autoCapitalize="none"
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={{ gap: Spacing.sm }}
        renderItem={({ item }) => {
          const inCart = cart.find((c) => c.product.id === item.id)
          return (
            <TouchableOpacity
              style={[styles.productCard, inCart && styles.productCardActive]}
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <View style={styles.productEmoji}>
                <Text style={{ fontSize: 28 }}>☕</Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              {item.variant && <Text style={styles.productVariant}>{item.variant}</Text>}
              <MoneyText amount={item.price} size={FontSize.sm} color={Colors.brand} />
              {inCart && (
                <View style={styles.inCartBadge}>
                  <Text style={styles.inCartBadgeText}>{inCart.qty}</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Маҳсулот нест" />}
      />

      {/* Cart FAB */}
      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartFab} onPress={() => setCartOpen(true)}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.cartFabText}>{cartCount} • {formatMoney(total)}</Text>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <Modal visible={cartOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.cartModal}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Сабад</Text>
            <TouchableOpacity onPress={() => setCartOpen(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <MoneyText amount={multiplyMoney(item.product.price, item.qty)} size={FontSize.sm} color={Colors.text} />
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.product.id)}>
                    <Ionicons name="remove" size={16} color={Colors.brand} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item.product)}>
                    <Ionicons name="add" size={16} color={Colors.brand} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Discount */}
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Тахфиф (см)</Text>
              <RNTextInput
                style={styles.discountInput} value={discount} onChangeText={setDiscount}
                keyboardType="decimal-pad" placeholder="0"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Payment Method */}
            <Text style={[styles.cartItemName, { marginTop: Spacing.sm }]}>Усули пардохт</Text>
            <View style={styles.payMethodGrid}>
              {PAY_METHODS.map(({ key, label, icon }) => (
                <TouchableOpacity
                  key={key} style={[styles.payMethodBtn, payMethod === key && styles.payMethodActive]}
                  onPress={() => setPayMethod(key)}
                >
                  <Ionicons name={icon as any} size={18} color={payMethod === key ? Colors.brand : Colors.textSecondary} />
                  <Text style={[styles.payMethodLabel, payMethod === key && styles.payMethodLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Mixed payment input */}
            {payMethod === 'MIXED' && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>Нақд (см)</Text>
                <RNTextInput
                  style={styles.discountInput} value={cashAmount} onChangeText={setCashAmount}
                  keyboardType="decimal-pad" placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            )}

            {/* Total */}
            <View style={styles.totalSummary}>
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>Ҷамъ</Text>
                <MoneyText amount={subtotal} />
              </View>
              {discountAmt.gt(0) && (
                <View style={styles.totalLine}>
                  <Text style={styles.totalLineLabel}>Тахфиф</Text>
                  <MoneyText amount={discountAmt} color={Colors.error} />
                </View>
              )}
              <View style={[styles.totalLine, styles.totalFinal]}>
                <Text style={styles.finalLabel}>Ҳамагӣ</Text>
                <MoneyText amount={total} size={FontSize.xl} color={Colors.brand} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutBar}>
            <Button
              title={createSale.isPending ? 'Сабт шудан...' : `Пардохт — ${formatMoney(total)}`}
              onPress={handleCheckout}
              loading={createSale.isPending}
              fullWidth
              style={{ height: 52 }}
            />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={!!successSale} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Фурӯш сабт шуд!</Text>
            {successSale && (
              <>
                <Text style={styles.successNumber}>#{successSale.saleNumber}</Text>
                <MoneyText amount={successSale.total} size={FontSize.xxl} color={Colors.brand} />
              </>
            )}
            <Button title="Давом кун" onPress={() => setSuccessSale(null)} style={{ marginTop: Spacing.xl, width: '100%' }} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

function HistoryTab() {
  const [voidId, setVoidId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sales', 'list'],
    queryFn: () => salesApi.list({ limit: 30, page: 1 }),
  })

  const voidMutation = useMutation({
    mutationFn: (id: string) => salesApi.void(id),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Фурӯш бекор карда шуд' })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      setVoidId(null)
    },
  })

  const getPayLabel = (method: string) => ({ CASH: 'Нақд', CARD: 'Корт', TRANSFER: 'Ҳавола', MIXED: 'Омехта' }[method] ?? method)
  const getStatusBadge = (status: string) => ({ COMPLETED: 'success', VOID: 'error', REFUNDED: 'warning' }[status] as any ?? 'default')

  return (
    <FlatList
      data={data?.data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.historyList}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      renderItem={({ item }) => (
        <Card style={styles.saleCard}>
          <View style={styles.saleRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.saleTopRow}>
                <Text style={styles.saleNumber}>#{item.saleNumber}</Text>
                <Badge label={getPayLabel(item.paymentMethod)} variant="outline" />
                <Badge label={item.status} variant={getStatusBadge(item.status)} />
              </View>
              <Text style={styles.saleDate}>{formatDateTime(item.createdAt)}</Text>
              <Text style={styles.saleItems}>{item.items.length} маҳсулот</Text>
            </View>
            <View style={styles.saleRight}>
              <MoneyText amount={item.total} size={FontSize.md} color={Colors.brand} />
              {item.status === 'COMPLETED' && (
                <TouchableOpacity style={styles.voidBtn} onPress={() => setVoidId(item.id)}>
                  <Ionicons name="trash-outline" size={14} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      )}
      ListEmptyComponent={<EmptyState icon="receipt-outline" title="Фурӯш нест" />}
    />
  )
}

export function SalesScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos')

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Фурӯш" />
      <View style={styles.tabs}>
        {(['pos', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'pos' ? '⚡ POS' : '📋 Таърих'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'pos' ? <POSTab /> : <HistoryTab />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.brand },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabTextActive: { color: Colors.brand },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  productsGrid: { padding: Spacing.md, gap: Spacing.sm },
  productCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
    position: 'relative',
  },
  productCardActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  productEmoji: {
    width: 52, height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  productName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'center', marginBottom: 2 },
  productVariant: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  inCartBadge: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: Colors.brand, borderRadius: Radius.full, width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  inCartBadgeText: { fontSize: 10, color: '#fff', fontWeight: FontWeight.bold },
  cartFab: {
    position: 'absolute', bottom: Spacing.xl, left: Spacing.lg, right: Spacing.lg,
    backgroundColor: Colors.brand, borderRadius: Radius.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, gap: Spacing.sm,
    shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  cartFabText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cartModal: { flex: 1, backgroundColor: Colors.background },
  cartHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingTop: Spacing.xl,
  },
  cartTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  cartItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.md, padding: Spacing.md,
  },
  cartItemName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, minWidth: 24, textAlign: 'center' },
  discountRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary, borderRadius: Radius.md, padding: Spacing.md,
  },
  discountLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  discountInput: {
    fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.semibold,
    textAlign: 'right', minWidth: 80,
  },
  payMethodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  payMethodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  payMethodActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  payMethodLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  payMethodLabelActive: { color: Colors.brand },
  totalSummary: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: Spacing.md, gap: Spacing.sm,
  },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLineLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalFinal: {
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm,
  },
  finalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  checkoutBar: {
    padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  successBox: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xxl, alignItems: 'center',
  },
  successIcon: { marginBottom: Spacing.md },
  successTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  successNumber: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  historyList: { padding: Spacing.md, gap: Spacing.sm },
  saleCard: {},
  saleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  saleTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap', marginBottom: 4 },
  saleNumber: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  saleDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  saleItems: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  saleRight: { alignItems: 'flex-end', gap: 8 },
  voidBtn: {
    padding: 6, borderRadius: Radius.sm,
    backgroundColor: Colors.errorLight,
  },
})
