import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { businessApi } from '../../api/business.api'
import { salesApi } from '../../api/sales.api'
import { inventoryApi } from '../../api/inventory.api'
import { cashboxApi } from '../../api/cashbox.api'
import { fixedExpensesApi } from '../../api/fixed-expenses.api'
import { Card } from '../../components/ui/Card'
import { KpiCard } from '../../components/ui/KpiCard'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { HomeTabParamList } from '../../navigation/types'

const currentMonth = dayjs().format('YYYY-MM')

export function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<BottomTabNavigationProp<HomeTabParamList>>()

  const { data: todayStats, isLoading: loadStats, refetch: r1 } = useQuery({
    queryKey: ['sales', 'stats-today'],
    queryFn: salesApi.statsToday,
    refetchInterval: 30000,
  })

  const { data: dashboard, refetch: r2 } = useQuery({
    queryKey: ['business', 'dashboard'],
    queryFn: businessApi.dashboard,
  })

  const { data: lowStock = [], refetch: r3 } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  })

  const { data: cashbox, refetch: r4 } = useQuery({
    queryKey: ['cashbox', 'balance'],
    queryFn: cashboxApi.getBalance,
  })

  const { data: fixedSummary, refetch: r5 } = useQuery({
    queryKey: ['fixed-expenses', 'summary', currentMonth],
    queryFn: () => fixedExpensesApi.summary(currentMonth),
  })

  const refresh = () => { r1(); r2(); r3(); r4(); r5() }

  const todayLabel = dayjs().format('DD MMMM YYYY, dddd')

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={Colors.brand} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>CB</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Идоракунӣ</Text>
            <Text style={styles.headerDate}>{todayLabel}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          {lowStock.length > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <KpiCard
          label="Фурӯши имрӯз" value={todayStats?.totalSales ?? '0'}
          icon="trending-up-outline" iconBg={Colors.brand}
          change={todayStats?.vsYesterday}
        />
        <KpiCard
          label="Фурӯши нақд" value={todayStats?.cashSales ?? '0'}
          icon="cash-outline" iconBg={Colors.success}
          sub={`${todayStats?.saleCount ?? 0} амалиёт`}
        />
        <KpiCard
          label="Фурӯши корт" value={todayStats?.cardSales ?? '0'}
          icon="card-outline" iconBg={Colors.info}
        />
        <KpiCard
          label="Шумораи фурӯш" value={todayStats?.saleCount ?? 0}
          isMoney={false}
          icon="bag-handle-outline" iconBg={Colors.violet}
        />
      </View>

      {/* Cashbox Balance */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Тавонои касса</Text>
        <View style={styles.cashRow}>
          <View style={styles.cashItem}>
            <View style={[styles.cashIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="cash-outline" size={16} color={Colors.success} />
            </View>
            <Text style={styles.cashLabel}>Нақд</Text>
            <MoneyText amount={cashbox?.cashBalance ?? '0'} color={Colors.success} />
          </View>
          <View style={styles.cashDivider} />
          <View style={styles.cashItem}>
            <View style={[styles.cashIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="card-outline" size={16} color={Colors.info} />
            </View>
            <Text style={styles.cashLabel}>Корт</Text>
            <MoneyText amount={cashbox?.cardBalance ?? '0'} color={Colors.info} />
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Ҳамагӣ</Text>
          <MoneyText amount={cashbox?.totalBalance ?? '0'} size={FontSize.xl} color={Colors.brand} />
        </View>
      </Card>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Огоҳии захира</Text>
            <Badge label={`${lowStock.length}`} variant="error" />
          </View>
          {lowStock.slice(0, 4).map((item) => (
            <View key={item.id} style={styles.stockRow}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{item.name}</Text>
                <Text style={styles.stockLevel}>
                  {item.currentStock} / {item.minStockLevel} {item.unit.toLowerCase()}
                </Text>
              </View>
              <Badge label="Кам" variant="error" />
            </View>
          ))}
        </Card>
      )}

      {/* Fixed Expenses Summary */}
      {fixedSummary && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💸 Хароҷоти моҳ</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Ҳама →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fixedRow}>
            <View style={[styles.fixedItem, { backgroundColor: Colors.successLight }]}>
              <Text style={styles.fixedLabel}>Пардохта</Text>
              <MoneyText amount={fixedSummary.totalPaid} color={Colors.success} size={FontSize.md} />
            </View>
            <View style={[styles.fixedItem, { backgroundColor: Colors.warningLight }]}>
              <Text style={styles.fixedLabel}>Интизор</Text>
              <MoneyText amount={fixedSummary.totalPending} color={Colors.warning} size={FontSize.md} />
            </View>
          </View>
          <Text style={styles.fixedCount}>{fixedSummary.paidCount}/{fixedSummary.count} пардохта шуд</Text>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Амалиёти зуд</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'cart-outline', label: 'Фурӯши нав', tab: 'SalesTab', color: Colors.brandFaded, textColor: Colors.brand },
            { icon: 'cube-outline', label: 'Захира', tab: 'InventoryTab', color: Colors.successLight, textColor: Colors.success },
            { icon: 'people-outline', label: 'Кормандон', tab: 'StaffTab', color: Colors.infoLight, textColor: Colors.info },
            { icon: 'menu-outline', label: 'Бештар', tab: 'MoreTab', color: Colors.violetLight, textColor: Colors.violet },
          ].map(({ icon, label, tab, color, textColor }) => (
            <TouchableOpacity
              key={tab}
              style={[styles.actionBtn, { backgroundColor: color }]}
              onPress={() => navigation.navigate(tab as any)}
            >
              <Ionicons name={icon as any} size={22} color={textColor} />
              <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.lg, paddingBottom: 32, gap: Spacing.md },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoMark: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 13, fontWeight: FontWeight.bold },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  headerDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error,
  },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  section: {},
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  viewAll: { fontSize: FontSize.sm, color: Colors.brand, fontWeight: FontWeight.medium },
  cashRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  cashItem: { flex: 1, alignItems: 'center', gap: 4 },
  cashIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cashLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cashDivider: { width: 1, backgroundColor: Colors.border },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  stockRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  stockInfo: {},
  stockName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  stockLevel: { fontSize: FontSize.xs, color: Colors.error, marginTop: 2 },
  fixedRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  fixedItem: { flex: 1, borderRadius: Radius.md, padding: Spacing.md, gap: 4 },
  fixedLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  fixedCount: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: {
    flex: 1, minWidth: '44%', borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', gap: 6,
  },
  actionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
})
