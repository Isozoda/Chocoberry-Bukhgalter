import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import Decimal from 'decimal.js'
import { useTheme } from '../../../src/theme'
import { suppliersApi } from '../../../src/api/suppliers.api'
import { inventoryApi } from '../../../src/api/inventory.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { SearchBar } from '../../../src/components/ui/SearchBar'
import { FilterChips } from '../../../src/components/ui/FilterChips'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { SwitchField } from '../../../src/components/forms/SwitchField'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import { multiplyMoney } from '../../../src/utils/decimal.util'
import { useDebounce } from '../../../src/hooks/useDebounce'
import type { Supplier } from '../../../src/types/supplier.types'

const TYPE_CHIPS = [
  { key: 'ALL', label: 'Ҳама' },
  { key: 'FRUIT', label: 'Мева' },
  { key: 'CHOCOLATE', label: 'Шоколад' },
  { key: 'CONSUMABLE', label: 'Расходник' },
]

export default function SuppliersScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [purchaseSupplier, setPurchaseSupplier] = useState<Supplier | null>(null)

  // Purchase form state
  const [invItemId, setInvItemId] = useState('')
  const [byBox, setByBox] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [boxCount, setBoxCount] = useState('')
  const [kgPerBox, setKgPerBox] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [purchaseNotes, setPurchaseNotes] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<any>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { type: typeFilter, search: debouncedSearch }],
    queryFn: () => suppliersApi.list({ type: typeFilter === 'ALL' ? undefined : typeFilter, search: debouncedSearch || undefined, limit: 100 }),
  })

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-all'],
    queryFn: () => inventoryApi.list({ limit: 200 }),
  })

  const purchaseMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => suppliersApi.purchase(id, dto),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      setPurchaseResult(result)
      setShowSuccess(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.purchaseSuccess') })
    },
  })

  const totalKg = byBox && boxCount && kgPerBox
    ? multiplyMoney(boxCount, kgPerBox)
    : new Decimal(quantity || '0')

  const totalAmount = totalKg.times(new Decimal(pricePerUnit || '0'))

  const handlePurchase = async () => {
    if (!purchaseSupplier || !invItemId || !pricePerUnit) return
    await purchaseMutation.mutateAsync({
      id: purchaseSupplier.id,
      dto: {
        inventoryItemId: invItemId,
        unit: 'KG',
        quantity: byBox ? undefined : quantity,
        boxCount: byBox ? Number(boxCount) : undefined,
        kgPerBox: byBox ? kgPerBox : undefined,
        pricePerUnit,
        notes: purchaseNotes || undefined,
      },
    })
  }

  const { isError, refetch } = useQuery({
    queryKey: ['suppliers', { type: typeFilter, search: debouncedSearch }],
    queryFn: () => suppliersApi.list({ type: typeFilter === 'ALL' ? undefined : typeFilter, search: debouncedSearch || undefined, limit: 100 }),
  })

  const renderSupplierItem = React.useCallback(({ item: supplier }: { item: Supplier }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/suppliers/${supplier.id}` as any)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.cardMain}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{supplier.name}</Text>
        <Badge label={supplier.type} variant="info" />
      </View>
      {supplier.phone && (
        <Text style={[styles.phone, { color: colors.textSecondary }]}>{supplier.phone}</Text>
      )}
      <View style={styles.cardFooter}>
        <MoneyText amount={supplier.totalPurchases} size={fontSize.sm} color={colors.textSecondary} />
        <TouchableOpacity
          onPress={() => {
            setPurchaseSupplier(supplier)
            setInvItemId(''); setByBox(false); setQuantity(''); setBoxCount(''); setKgPerBox(''); setPricePerUnit(''); setPurchaseNotes('')
          }}
          style={[styles.buyBtn, { backgroundColor: colors.brand, borderRadius: radius.md }]}
        >
          <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
            {t('actions.buy')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [colors, t, router])

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('nav.suppliers')} showBack={false} />

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      <FilterChips chips={TYPE_CHIPS} selected={typeFilter} onSelect={setTypeFilter} />

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={renderSupplierItem}
        ListEmptyComponent={
          isError ? (
            <EmptyState message={t('errors.fetchFailed')} icon="alert-circle-outline" onRetry={refetch} retryLabel={t('actions.retry')} />
          ) : (
            <EmptyState message={t('empty.noSuppliers')} />
          )
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Purchase Modal */}
      <Modal visible={!!purchaseSupplier} animationType="slide" onRequestClose={() => setPurchaseSupplier(null)}>
        <ScreenWrapper>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('suppliers.purchase')} — {purchaseSupplier?.name}
            </Text>
            <TouchableOpacity onPress={() => setPurchaseSupplier(null)}>
              <Text style={{ color: colors.brand, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: spacing[4] }}>
            {/* Inventory item select */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('labels.type')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[4] }}>
              {(inventoryData?.items ?? []).map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setInvItemId(item.id)}
                  style={[
                    styles.invChip,
                    {
                      backgroundColor: invItemId === item.id ? colors.brand : colors.surfaceAlt,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Text style={{ color: invItemId === item.id ? '#fff' : colors.textSecondary, fontSize: fontSize.sm }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <SwitchField
              label={byBox ? t('suppliers.byBox') : t('suppliers.byKg')}
              value={byBox}
              onValueChange={setByBox}
            />

            {byBox ? (
              <View style={styles.boxRow}>
                <FormInput label={t('suppliers.boxCount')} value={boxCount} onChangeText={setBoxCount} keyboardType="decimal-pad" style={{ flex: 1 }} />
                <MoneyInput label={t('suppliers.kgPerBox')} value={kgPerBox} onChangeText={setKgPerBox} placeholder="50" suffix="кг" style={{ flex: 1 }} />
              </View>
            ) : (
              <MoneyInput label={t('labels.quantity') + ' (кг)'} value={quantity} onChangeText={setQuantity} placeholder="0" suffix="кг" />
            )}

            {/* Live preview */}
            {(byBox ? (boxCount && kgPerBox) : quantity) && (
              <View style={[styles.preview, { backgroundColor: colors.surfaceAlt }]}>
                {byBox && <Text style={{ color: colors.textSecondary }}>{boxCount} × {kgPerBox} = <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.bold }}>{totalKg.toFixed(2)} кг</Text></Text>}
                {pricePerUnit && <Text style={{ color: colors.textSecondary }}>{totalKg.toFixed(2)} кг × {pricePerUnit} = <MoneyText amount={totalAmount} bold /></Text>}
              </View>
            )}

            <MoneyInput label={t('suppliers.kgPerBox').replace('кг дар', 'Нарх дар')} value={pricePerUnit} onChangeText={setPricePerUnit} placeholder="0" />
            <FormInput label={t('labels.notes')} value={purchaseNotes} onChangeText={setPurchaseNotes} multiline />

            <TouchableOpacity
              onPress={handlePurchase}
              disabled={!invItemId || !pricePerUnit || purchaseMutation.isPending}
              style={[styles.purchaseBtn, { backgroundColor: colors.brand, borderRadius: radius.lg, opacity: !invItemId || !pricePerUnit ? 0.5 : 1 }]}
            >
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
                {purchaseMutation.isPending ? '...' : t('suppliers.purchase')}
              </Text>
            </TouchableOpacity>

            <View style={{ height: spacing[8] }} />
          </ScrollView>
        </ScreenWrapper>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 40 }}>✅</Text>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>{t('toast.purchaseSuccess')}</Text>
            {purchaseResult?.forecast && (
              <View style={{ gap: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>🥤 0.3ml: ~{purchaseResult.forecast.cups03} {t('units.piece')}</Text>
                <Text style={{ color: colors.textSecondary }}>🥤 0.4ml: ~{purchaseResult.forecast.cups04} {t('units.piece')}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => { setShowSuccess(false); setPurchaseSupplier(null) }}
              style={[styles.successBtn, { backgroundColor: colors.brand, borderRadius: radius.md }]}
            >
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('actions.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  searchRow: { padding: spacing[4], paddingBottom: 0 },
  list: { padding: spacing[4], gap: spacing[3] },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing[4], gap: spacing[2] },
  cardMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, flex: 1 },
  phone: { fontSize: fontSize.sm },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buyBtn: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  modalTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, flex: 1 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing[2] },
  invChip: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], marginRight: spacing[2] },
  boxRow: { flexDirection: 'row', gap: spacing[3] },
  preview: { borderRadius: radius.md, padding: spacing[3], marginVertical: spacing[3], gap: spacing[1] },
  purchaseBtn: { padding: spacing[4], alignItems: 'center', marginTop: spacing[4] },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  successCard: { width: '85%', borderRadius: radius.xl, padding: spacing[6], alignItems: 'center', gap: spacing[4] },
  successTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  successBtn: { paddingHorizontal: spacing[8], paddingVertical: spacing[3] },
})
