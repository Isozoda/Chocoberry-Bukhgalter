import React, { useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../src/theme'
import { suppliersApi } from '../../../src/api/suppliers.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { formatDate } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

type Tab = 'purchases' | 'priceHistory'

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('purchases')

  const { data: supplier } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersApi.getById(id),
  })

  const { data: purchasesData, isLoading } = useQuery({
    queryKey: ['supplier-purchases', id],
    queryFn: () => suppliersApi.getPurchases(id, { limit: 50 }),
    enabled: tab === 'purchases',
  })

  const { data: priceHistory } = useQuery({
    queryKey: ['supplier-price-history', id],
    queryFn: () => suppliersApi.getPriceHistory(id),
    enabled: tab === 'priceHistory',
  })

  return (
    <ScreenWrapper scroll={false}>
      <Header title={supplier?.name ?? '...'} />

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {([['purchases', t('suppliers.purchases')], ['priceHistory', t('suppliers.priceHistory')]] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tabBtn, { borderBottomColor: tab === key ? colors.brand : 'transparent' }]}
          >
            <Text style={[styles.tabLabel, { color: tab === key ? colors.brand : colors.textSecondary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <LoadingSkeleton /> : (
        <FlatList
          data={tab === 'purchases' ? (purchasesData?.items ?? []) : (priceHistory ?? [])}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                  {tab === 'purchases' ? item.inventoryItem?.name : `${item.pricePerUnit} см/кг`}
                </Text>
                <Text style={[styles.rowDate, { color: colors.textSecondary }]}>
                  {formatDate(tab === 'purchases' ? item.createdAt : item.recordedAt)}
                </Text>
              </View>
              {tab === 'purchases' ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.qty, { color: colors.textSecondary }]}>{item.totalKg} кг</Text>
                  <MoneyText amount={item.totalAmount} bold />
                </View>
              ) : (
                <MoneyText amount={item.pricePerUnit} bold />
              )}
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, padding: spacing[4], alignItems: 'center', borderBottomWidth: 2 },
  tabLabel: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  list: { padding: spacing[4], gap: spacing[3] },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1 },
  rowTitle: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  rowDate: { fontSize: fontSize.xs, marginTop: 2 },
  qty: { fontSize: fontSize.sm },
})
