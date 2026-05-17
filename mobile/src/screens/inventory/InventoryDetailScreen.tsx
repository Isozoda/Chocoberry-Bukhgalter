import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRoute, type RouteProp } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { inventoryApi } from '../../api/inventory.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { MoneyText } from '../../components/ui/MoneyText'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { InventoryStackParamList } from '../../navigation/types'

type Route = RouteProp<InventoryStackParamList, 'InventoryDetail'>

type SheetType = 'stockIn' | 'stockOut' | 'waste' | 'adjust' | null

export function InventoryDetailScreen() {
  const insets = useSafeAreaInsets()
  const { params } = useRoute<Route>()
  const queryClient = useQueryClient()
  const [sheet, setSheet] = useState<SheetType>(null)
  const [qty, setQty] = useState('')
  const [cost, setCost] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const { data: item, isLoading, refetch } = useQuery({
    queryKey: ['inventory', params.id],
    queryFn: () => inventoryApi.getById(params.id),
  })

  const { data: history } = useQuery({
    queryKey: ['inventory', params.id, 'history'],
    queryFn: () => inventoryApi.getHistory(params.id, { limit: 20 }),
  })

  const onSuccess = () => {
    Toast.show({ type: 'success', text1: 'Амалиёт иҷро шуд' })
    setSheet(null); setQty(''); setCost(''); setReason(''); setNotes('')
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
  }

  const stockInMut = useMutation({ mutationFn: (d: any) => inventoryApi.stockIn(params.id, d), onSuccess })
  const stockOutMut = useMutation({ mutationFn: (d: any) => inventoryApi.stockOut(params.id, d), onSuccess })
  const wasteMut = useMutation({ mutationFn: (d: any) => inventoryApi.waste(params.id, d), onSuccess })
  const adjustMut = useMutation({ mutationFn: (d: any) => inventoryApi.adjust(params.id, d), onSuccess })

  const handleSubmit = () => {
    const quantity = Number(qty)
    if (!quantity || quantity <= 0) { Toast.show({ type: 'error', text1: 'Миқдорро ворид кунед' }); return }
    if (sheet === 'stockIn') stockInMut.mutate({ quantity, unitCost: cost ? Number(cost) : undefined, notes })
    if (sheet === 'stockOut') stockOutMut.mutate({ quantity, reason, notes })
    if (sheet === 'waste') wasteMut.mutate({ quantity, reason: reason || 'Партов', notes })
    if (sheet === 'adjust') adjustMut.mutate({ newQuantity: quantity, reason, notes })
  }

  const isPending = stockInMut.isPending || stockOutMut.isPending || wasteMut.isPending || adjustMut.isPending

  const getHistoryColor = (type: string) => {
    if (['IN'].includes(type)) return Colors.success
    if (['OUT', 'WASTE', 'CLEANING_LOSS'].includes(type)) return Colors.error
    return Colors.textSecondary
  }

  const getHistoryIcon = (type: string) => {
    if (type === 'IN') return 'arrow-down-circle-outline'
    if (type === 'OUT') return 'arrow-up-circle-outline'
    if (type === 'WASTE') return 'trash-outline'
    if (type === 'ADJUSTMENT') return 'settings-outline'
    return 'swap-horizontal-outline'
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={item?.name ?? 'Захира'} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        {/* Stats */}
        <Card>
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Захираи ҷорӣ</Text>
              <Text style={[styles.statVal, { color: Colors.brand }]}>
                {item?.currentStock ?? '—'} <Text style={styles.statUnit}>{item?.unit?.toLowerCase()}</Text>
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Ҳадди ақал</Text>
              <Text style={styles.statVal}>{item?.minStockLevel ?? '—'} <Text style={styles.statUnit}>{item?.unit?.toLowerCase()}</Text></Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Арзиши миёна</Text>
              <MoneyText amount={item?.avgCost ?? '0'} size={FontSize.lg} />
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Навъ</Text>
              <Text style={styles.statVal}>{item?.category ?? '—'}</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {([
            { type: 'stockIn' as SheetType, label: 'Дохилшавӣ', icon: 'add-circle-outline', color: Colors.success },
            { type: 'stockOut' as SheetType, label: 'Хуруҷ', icon: 'remove-circle-outline', color: Colors.error },
            { type: 'waste' as SheetType, label: 'Партов', icon: 'trash-outline', color: Colors.warning },
            { type: 'adjust' as SheetType, label: 'Танзим', icon: 'settings-outline', color: Colors.info },
          ] as any[]).map(({ type, label, icon, color }) => (
            <TouchableOpacity key={type} style={[styles.actionBtn, { borderColor: color }]} onPress={() => setSheet(type)}>
              <Ionicons name={icon} size={20} color={color} />
              <Text style={[styles.actionLabel, { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>Таърих</Text>
        {(history?.data ?? []).map((h) => (
          <Card key={h.id} style={styles.historyCard}>
            <View style={styles.histRow}>
              <View style={[styles.histIcon, { backgroundColor: `${getHistoryColor(h.type)}20` }]}>
                <Ionicons name={getHistoryIcon(h.type) as any} size={18} color={getHistoryColor(h.type)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histType}>{h.type}</Text>
                <Text style={styles.histDate}>{formatDate(h.date)}</Text>
                {h.reason && <Text style={styles.histNote}>{h.reason}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.histQty, { color: getHistoryColor(h.type) }]}>
                  {['IN'].includes(h.type) ? '+' : '-'}{h.quantity}
                </Text>
                <Text style={styles.histStock}>{h.stockAfter} {item?.unit?.toLowerCase()}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Operation Sheet */}
      <BottomSheet
        visible={!!sheet}
        title={sheet === 'stockIn' ? 'Дохилшавӣ' : sheet === 'stockOut' ? 'Хуруҷ' : sheet === 'waste' ? 'Партов' : 'Танзим'}
        onClose={() => setSheet(null)}
      >
        <View style={styles.sheetForm}>
          <Text style={styles.fieldLabel}>{sheet === 'adjust' ? 'Миқдори нав' : 'Миқдор'} ({item?.unit?.toLowerCase()})</Text>
          <RNTextInput
            style={styles.fieldInput} value={qty} onChangeText={setQty}
            keyboardType="decimal-pad" placeholder="0.00"
            placeholderTextColor={Colors.textTertiary}
          />

          {sheet === 'stockIn' && (
            <>
              <Text style={styles.fieldLabel}>Нархи воҳид (см)</Text>
              <RNTextInput
                style={styles.fieldInput} value={cost} onChangeText={setCost}
                keyboardType="decimal-pad" placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
              />
            </>
          )}

          {(sheet === 'stockOut' || sheet === 'waste' || sheet === 'adjust') && (
            <>
              <Text style={styles.fieldLabel}>Сабаб</Text>
              <RNTextInput
                style={styles.fieldInput} value={reason} onChangeText={setReason}
                placeholder="Сабабро ворид кунед" placeholderTextColor={Colors.textTertiary}
              />
            </>
          )}

          <Text style={styles.fieldLabel}>Эзоҳ</Text>
          <RNTextInput
            style={[styles.fieldInput, { minHeight: 60 }]} value={notes} onChangeText={setNotes}
            placeholder="Ихтиёрӣ" placeholderTextColor={Colors.textTertiary} multiline
          />

          <Button
            title={isPending ? 'Сабт шудан...' : 'Иҷро кун'}
            onPress={handleSubmit}
            loading={isPending}
            fullWidth
            style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
          />
        </View>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statBlock: { minWidth: '44%', flex: 1 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  statUnit: { fontSize: FontSize.sm, color: Colors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1.5, gap: 4,
    backgroundColor: Colors.surface,
  },
  actionLabel: { fontSize: 11, fontWeight: FontWeight.semibold },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  historyCard: { padding: Spacing.md },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  histIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  histType: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  histDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  histNote: { fontSize: FontSize.xs, color: Colors.textTertiary },
  histQty: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  histStock: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sheetForm: { paddingTop: Spacing.md, gap: Spacing.sm },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  fieldInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
  },
})
