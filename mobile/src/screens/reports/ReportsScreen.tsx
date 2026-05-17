import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { reportsApi } from '../../api/reports.api'
import { salesApi } from '../../api/sales.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { MoneyText } from '../../components/ui/MoneyText'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'

type Tab = 'profit' | 'monthly' | 'topProducts'

export function ReportsScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<Tab>('profit')

  const today = dayjs()
  const from = today.startOf('month').format('YYYY-MM-DD')
  const to = today.format('YYYY-MM-DD')
  const year = today.year()
  const month = today.month() + 1

  const { data: profit, isLoading: l1, refetch: r1 } = useQuery({
    queryKey: ['reports', 'profit', { from, to }],
    queryFn: () => reportsApi.profit({ from, to }),
    enabled: activeTab === 'profit',
  })

  const { data: monthly, isLoading: l2, refetch: r2 } = useQuery({
    queryKey: ['reports', 'monthly', { year, month }],
    queryFn: () => reportsApi.monthly({ year, month }),
    enabled: activeTab === 'monthly',
  })

  const { data: topProducts, isLoading: l3, refetch: r3 } = useQuery({
    queryKey: ['reports', 'topProducts', { from, to }],
    queryFn: () => reportsApi.topProducts({ from, to, limit: 10 }),
    enabled: activeTab === 'topProducts',
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profit', label: '💰 Фоида' },
    { key: 'monthly', label: '📅 Моҳона' },
    { key: 'topProducts', label: '🏆 Беҳтарин' },
  ]

  const profitData = profit as any
  const monthlyData = monthly as any
  const topData = topProducts as any

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Ҳисоботҳо" showBack />

      <View style={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <TouchableOpacity
            key={key} style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={l1 || l2 || l3} onRefresh={() => { r1(); r2(); r3() }} tintColor={Colors.brand} />}
      >
        {activeTab === 'profit' && profitData && (
          <>
            <Card>
              <Text style={styles.periodLabel}>Моҳи ҷорӣ: {from} — {to}</Text>
              <View style={styles.profitGrid}>
                {[
                  { label: 'Даромади умумӣ', value: profitData.totalRevenue, color: Colors.success },
                  { label: 'Хароҷоти умумӣ', value: profitData.totalExpenses, color: Colors.error },
                  { label: 'Фоидаи соф', value: profitData.netProfit, color: Colors.brand },
                  { label: 'Фоидаи умумӣ', value: profitData.grossProfit, color: Colors.info },
                ].map(({ label, value, color }) => (
                  <View key={label} style={styles.profitItem}>
                    <Text style={styles.profitLabel}>{label}</Text>
                    <MoneyText amount={value ?? '0'} size={FontSize.xl} color={color} />
                  </View>
                ))}
              </View>
            </Card>
            {profitData.byExpenseType && (
              <Card>
                <Text style={styles.sectionTitle}>Хароҷот аз рӯи навъ</Text>
                {profitData.byExpenseType.map((e: any) => (
                  <View key={e.type} style={styles.expLine}>
                    <Text style={styles.expLineLabel}>{e.type}</Text>
                    <MoneyText amount={e.total} size={FontSize.sm} color={Colors.error} />
                  </View>
                ))}
              </Card>
            )}
          </>
        )}

        {activeTab === 'monthly' && monthlyData && (
          <Card>
            <Text style={styles.periodLabel}>Моҳи {month}/{year}</Text>
            <View style={styles.profitGrid}>
              {[
                { label: 'Фурӯши умумӣ', value: monthlyData.totalSales ?? monthlyData.revenue, color: Colors.success },
                { label: 'Хароҷоти умумӣ', value: monthlyData.totalExpenses, color: Colors.error },
                { label: 'Фоидаи соф', value: monthlyData.netProfit, color: Colors.brand },
                { label: 'Шумораи фурӯш', value: `${monthlyData.saleCount ?? 0}`, color: Colors.info },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.profitItem}>
                  <Text style={styles.profitLabel}>{label}</Text>
                  <Text style={[styles.profitVal, { color }]}>{value ?? '—'}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {activeTab === 'topProducts' && topData && (
          <Card>
            <Text style={styles.sectionTitle}>Маҳсулоти беҳтарин (ин моҳ)</Text>
            {(topData.products ?? topData).map((p: any, idx: number) => (
              <View key={p.productId ?? idx} style={styles.productLine}>
                <View style={styles.productRank}>
                  <Text style={styles.productRankText}>{idx + 1}</Text>
                </View>
                <Text style={styles.productName}>{p.name}</Text>
                <View style={styles.productStats}>
                  <Text style={styles.productQty}>{p.qty ?? p.count} дона</Text>
                  <MoneyText amount={p.revenue} size={FontSize.sm} color={Colors.brand} />
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.brand },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.brand, fontWeight: FontWeight.semibold },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  periodLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.md },
  profitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  profitItem: { minWidth: '44%', flex: 1 },
  profitLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  profitVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  expLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  expLineLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  productLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  productRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center' },
  productRankText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.brand },
  productName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  productStats: { alignItems: 'flex-end' },
  productQty: { fontSize: FontSize.xs, color: Colors.textSecondary },
})
