import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../src/theme'
import { inventoryApi } from '../../../src/api/inventory.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { formatDateTime } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function InventoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => inventoryApi.getById(id),
  })

  const { data: history } = useQuery({
    queryKey: ['inventory-history', id],
    queryFn: () => inventoryApi.getHistory(id),
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header title={item?.name ?? '...'} />

      <View style={[styles.statsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('inventory.currentStock')}</Text>
          <Text style={[styles.statVal, { color: colors.textPrimary }]}>{item?.currentStock} {item?.unit}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('inventory.avgCost')}</Text>
          <MoneyText amount={item?.avgCost ?? '0'} bold />
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('inventory.minStock')}</Text>
          <Text style={[styles.statVal, { color: colors.textPrimary }]}>{item?.minStockLevel} {item?.unit}</Text>
        </View>
      </View>

      <FlatList
        data={Array.isArray(history) ? history : []}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: move }) => {
          const isIn = ['IN', 'CLEANING'].includes(move.type)
          return (
            <View style={[styles.moveRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Badge label={move.type} variant={isIn ? 'success' : move.type === 'WASTE' ? 'danger' : 'default'} />
                <Text style={[styles.reason, { color: colors.textSecondary }]}>{move.reason ?? move.notes ?? ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.qty, { color: isIn ? colors.green : colors.red }]}>
                  {isIn ? '+' : '−'}{move.quantity}
                </Text>
                <Text style={[styles.balance, { color: colors.textTertiary }]}>{move.balanceAfter}</Text>
                <Text style={[styles.date, { color: colors.textTertiary }]}>{formatDateTime(move.createdAt)}</Text>
              </View>
            </View>
          )
        }}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', padding: spacing[4], borderBottomWidth: 1 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: fontSize.xs },
  statVal: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  list: { padding: spacing[4], gap: spacing[2] },
  moveRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: radius.md, borderWidth: 1 },
  reason: { fontSize: fontSize.xs, marginTop: 2 },
  qty: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  balance: { fontSize: fontSize.xs },
  date: { fontSize: fontSize.xs },
})
