import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import Decimal from 'decimal.js'
import { useTheme } from '../../../src/theme'
import { inventoryApi } from '../../../src/api/inventory.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { SearchBar } from '../../../src/components/ui/SearchBar'
import { FilterChips } from '../../../src/components/ui/FilterChips'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { SwitchField } from '../../../src/components/forms/SwitchField'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { LowStockBadge } from '../../../src/components/ui/LowStockBadge'
import { formatMoney, toDecimal, multiplyMoney, subtractMoney } from '../../../src/utils/decimal.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import { useDebounce } from '../../../src/hooks/useDebounce'
import type { InventoryItem } from '../../../src/types/inventory.types'

const CATEGORY_CHIPS = [
  { key: 'ALL', label: 'Ҳама' },
  { key: 'FRUIT', label: 'Мева' },
  { key: 'CHOCOLATE', label: 'Шоколад' },
  { key: 'CONSUMABLE', label: 'Расходник' },
]

export default function InventoryScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [cleaningItem, setCleaningItem] = useState<InventoryItem | null>(null)
  const [rawQty, setRawQty] = useState('')
  const [actualCleaned, setActualCleaned] = useState('')
  const [useActual, setUseActual] = useState(false)
  const [cleaningNotes, setCleaningNotes] = useState('')

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', { category, search: debouncedSearch }],
    queryFn: () => inventoryApi.list({
      category: category === 'ALL' ? undefined : category,
      search: debouncedSearch || undefined,
      limit: 100,
    }),
  })

  const cleaningMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryApi.cleaning(id, dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      const rawN = new Decimal(rawQty || '0')
      const DEFAULT_LOSS = 0.15
      const cleanedN = useActual && actualCleaned
        ? new Decimal(actualCleaned)
        : rawN.times(1 - DEFAULT_LOSS)
      const loss = rawN.minus(cleanedN)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.cleaningSuccess'), text2: `${cleanedN.toFixed(2)}кг тоза (${loss.toFixed(2)}кг талаф)` })
      setCleaningItem(null)
      setRawQty(''); setActualCleaned(''); setUseActual(false); setCleaningNotes('')
    },
  })

  const items = data?.items ?? []
  const lowStockCount = items.filter((i) => new Decimal(i.currentStock).lessThan(i.minStockLevel)).length

  const handleCleaning = () => {
    if (!cleaningItem || !rawQty) return
    cleaningMutation.mutate({
      id: cleaningItem.id,
      dto: { rawQuantity: rawQty, actualCleanedQuantity: useActual ? actualCleaned : undefined, notes: cleaningNotes },
    })
  }

  // Live cleaning preview
  const rawNum = rawQty ? new Decimal(rawQty) : new Decimal(0)
  const DEFAULT_LOSS_PCT = 0.15
  const cleanedPreview = useActual && actualCleaned
    ? new Decimal(actualCleaned)
    : rawNum.times(1 - DEFAULT_LOSS_PCT)
  const lossPreview = rawNum.minus(cleanedPreview)
  const lossPct = rawNum.greaterThan(0) ? lossPreview.dividedBy(rawNum).times(100) : new Decimal(0)

  const { isError, refetch } = useQuery({
    queryKey: ['inventory', { category, search: debouncedSearch }],
    queryFn: () => inventoryApi.list({
      category: category === 'ALL' ? undefined : category,
      search: debouncedSearch || undefined,
      limit: 100,
    }),
  })

  const renderInventoryItem = React.useCallback(({ item }: { item: InventoryItem }) => {
    const isLow = new Decimal(item.currentStock).lessThan(item.minStockLevel)
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/inventory/${item.id}` as any)}
        style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: isLow ? colors.red : colors.border }]}
      >
        <View style={styles.itemMain}>
          <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
          <View style={styles.itemBadges}>
            {isLow && <LowStockBadge />}
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.stockText, { color: isLow ? colors.red : colors.green }]}>
            {item.currentStock} {item.unit}
          </Text>
          <Text style={[styles.avgCost, { color: colors.textSecondary }]}>{formatMoney(item.avgCost)}</Text>
        </View>
        <View style={styles.actions}>
          {['stockIn', 'stockOut', 'cleaning', 'waste'].map((action) => (
            <TouchableOpacity
              key={action}
              onPress={() => {
                if (action === 'cleaning') setCleaningItem(item)
                else router.push(`/(app)/inventory/${action}?id=${item.id}` as any)
              }}
              style={[styles.actionBtn, { backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[styles.actionText, { color: colors.textSecondary }]} numberOfLines={1}>
                {action === 'stockIn' ? '+' : action === 'stockOut' ? '−' : action === 'cleaning' ? '✓' : '🗑'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    )
  }, [colors, t, router])

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <SearchBar value={search} onChangeText={setSearch} />
        {lowStockCount > 0 && (
          <View style={[styles.lowBadge, { backgroundColor: colors.redLight }]}>
            <Text style={[styles.lowBadgeText, { color: colors.red }]}>⚠ {lowStockCount}</Text>
          </View>
        )}
      </View>

      <FilterChips chips={CATEGORY_CHIPS} selected={category} onSelect={setCategory} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderInventoryItem}
        ListEmptyComponent={
          isError ? (
            <EmptyState message={t('errors.fetchFailed')} icon="alert-circle-outline" onRetry={refetch} retryLabel={t('actions.retry')} />
          ) : (
            <EmptyState message={t('empty.noInventory')} />
          )
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Cleaning Modal */}
      <Modal visible={!!cleaningItem} animationType="slide" onRequestClose={() => setCleaningItem(null)}>
        <ScreenWrapper>
          <View style={[styles.cleanHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.cleanTitle, { color: colors.textPrimary }]}>
              {t('inventory.cleaning')} — {cleaningItem?.name}
            </Text>
            <TouchableOpacity onPress={() => setCleaningItem(null)}>
              <Text style={{ color: colors.brand }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: spacing[4] }}>
            <MoneyInput
              label={`${t('inventory.rawWeight')} (кг)`}
              value={rawQty}
              onChangeText={setRawQty}
              placeholder="120.00"
              suffix="кг"
            />

            {rawQty ? (
              <View style={[styles.previewCard, { backgroundColor: colors.surfaceAlt }]}>
                <View style={styles.previewRow}>
                  <Text style={{ color: colors.blue }}>ХОМ:</Text>
                  <Text style={{ color: colors.blue, fontWeight: fontWeight.semibold }}>{rawNum.toFixed(2)} кг</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={{ color: colors.red }}>ТАЛАФ ({lossPct.toFixed(0)}%):</Text>
                  <Text style={{ color: colors.red, fontWeight: fontWeight.semibold }}>{lossPreview.toFixed(2)} кг</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={{ color: colors.green }}>ТОЗА:</Text>
                  <Text style={{ color: colors.green, fontWeight: fontWeight.semibold }}>{cleanedPreview.toFixed(2)} кг</Text>
                </View>
              </View>
            ) : null}

            <SwitchField
              label={t('inventory.enterActualCleaned')}
              value={useActual}
              onValueChange={setUseActual}
            />

            {useActual && (
              <MoneyInput
                label={`${t('inventory.cleanedWeight')} (кг)`}
                value={actualCleaned}
                onChangeText={setActualCleaned}
                placeholder="102.00"
                suffix="кг"
              />
            )}

            <FormInput
              label={t('labels.notes')}
              value={cleaningNotes}
              onChangeText={setCleaningNotes}
              placeholder="..."
              multiline
            />

            <TouchableOpacity
              onPress={handleCleaning}
              disabled={!rawQty || cleaningMutation.isPending}
              style={[styles.cleanBtn, { backgroundColor: colors.brand, borderRadius: radius.lg, opacity: !rawQty ? 0.5 : 1 }]}
            >
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
                {cleaningMutation.isPending ? '...' : t('inventory.cleaningConfirm')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </ScreenWrapper>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], gap: spacing[2], borderBottomWidth: 1 },
  lowBadge: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.sm },
  lowBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  list: { padding: spacing[4], gap: spacing[3] },
  itemCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing[4], gap: spacing[3] },
  itemMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, flex: 1 },
  itemBadges: { flexDirection: 'row', gap: spacing[2], alignItems: 'center' },
  itemCategory: { fontSize: fontSize.xs },
  itemRight: { alignItems: 'flex-end' },
  stockText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  avgCost: { fontSize: fontSize.xs },
  actions: { flexDirection: 'row', gap: spacing[2] },
  actionBtn: { flex: 1, padding: spacing[2], borderRadius: radius.sm, alignItems: 'center' },
  actionText: { fontSize: fontSize.xs },
  cleanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  cleanTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, flex: 1 },
  previewCard: { borderRadius: radius.md, padding: spacing[4], marginVertical: spacing[4], gap: spacing[2] },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cleanBtn: { padding: spacing[4], alignItems: 'center', marginTop: spacing[4] },
})
