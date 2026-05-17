import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl, StyleSheet } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../../src/theme'
import { useAuthStore } from '../../../src/store/auth.store'
import { businessApi } from '../../../src/api/business.api'
import { salesApi } from '../../../src/api/sales.api'
import { inventoryApi } from '../../../src/api/inventory.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { StatsCard } from '../../../src/components/ui/StatsCard'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { SectionHeader } from '../../../src/components/ui/SectionHeader'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import { formatDate } from '../../../src/utils/date.util'
import dayjs from 'dayjs'

export default function DashboardScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: businessApi.dashboard,
  })

  const { data: todayStats, isLoading: todayLoading } = useQuery({
    queryKey: ['sales-today'],
    queryFn: salesApi.statsToday,
  })

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: inventoryApi.getLowStock,
  })

  const isLoading = dashLoading || todayLoading
  const refreshing = false

  const onRefresh = () => {
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    qc.invalidateQueries({ queryKey: ['sales-today'] })
    qc.invalidateQueries({ queryKey: ['low-stock'] })
  }

  if (isLoading) return <LoadingSkeleton />

  const lowStockItems = Array.isArray(lowStock) ? lowStock : []

  return (
    <ScreenWrapper scroll={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
              {t('dashboard.greeting', { name: user?.name?.split(' ')[0] ?? '' })} 🍓
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(new Date(), 'DD MMMM YYYY')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/business/profile')}>
            <View style={[styles.avatar, { backgroundColor: colors.brandLight }]}>
              <Text style={[styles.avatarText, { color: colors.brand }]}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* KPI Grid */}
        <View style={styles.section}>
          <View style={styles.grid}>
            <StatsCard
              title={t('dashboard.todaySales')}
              value={todayStats?.totalSales ?? '0'}
              isMoney
              icon="trending-up"
              iconColor={colors.green}
              iconBg={colors.greenLight}
            />
            <StatsCard
              title={t('dashboard.ordersCount')}
              value={String(todayStats?.orderCount ?? 0)}
              icon="receipt-outline"
              iconColor={colors.blue}
              iconBg={colors.blueLight}
            />
          </View>
          <View style={styles.grid}>
            <StatsCard
              title={t('dashboard.cashSales')}
              value={todayStats?.cashSales ?? '0'}
              isMoney
              icon="cash-outline"
              iconColor={colors.green}
              iconBg={colors.greenLight}
            />
            <StatsCard
              title={t('dashboard.cardSales')}
              value={todayStats?.cardSales ?? '0'}
              isMoney
              icon="card-outline"
              iconColor={colors.purple}
              iconBg={colors.purpleLight}
            />
          </View>
        </View>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <View style={[styles.alertCard, { backgroundColor: colors.redLight, marginHorizontal: spacing[4] }]}>
            <View style={styles.alertHeader}>
              <Text style={[styles.alertTitle, { color: colors.red }]}>
                ⚠ {t('dashboard.lowStockAlert', { count: lowStockItems.length })}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/inventory')}>
                <Text style={[styles.viewAll, { color: colors.brand }]}>{t('dashboard.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={lowStockItems.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.lowStockItem, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.lowStockName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.lowStockQty, { color: colors.red }]}>{item.currentStock} {item.unit}</Text>
                </View>
              )}
              contentContainerStyle={{ gap: spacing[2], paddingTop: spacing[2] }}
            />
          </View>
        )}

        {/* Quick Actions */}
        <SectionHeader title={t('dashboard.quickActions')} />
        <View style={[styles.quickGrid, { paddingHorizontal: spacing[4] }]}>
          {[
            { label: t('dashboard.addSale'), icon: 'cart', route: '/(app)/(tabs)/sales', color: colors.brand },
            { label: t('dashboard.addPurchase'), icon: 'bag-add', route: '/(app)/suppliers', color: colors.green },
            { label: t('dashboard.dailyReport'), icon: 'clipboard', route: '/(app)/(tabs)/daily-report', color: colors.blue },
            { label: t('dashboard.reports'), icon: 'bar-chart', route: '/(app)/reports', color: colors.purple },
          ].map((a) => (
            <TouchableOpacity
              key={a.route}
              onPress={() => router.push(a.route as any)}
              style={[styles.quickBtn, { backgroundColor: a.color + '20', borderRadius: radius.lg }]}
            >
              <Ionicons name={a.icon as any} size={24} color={a.color} />
              <Text style={[styles.quickLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], marginBottom: spacing[2] },
  greeting: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  date: { fontSize: fontSize.sm, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  section: { paddingHorizontal: spacing[4], gap: spacing[3], marginBottom: spacing[4] },
  grid: { flexDirection: 'row', gap: spacing[3] },
  alertCard: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  viewAll: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  lowStockItem: { borderRadius: radius.md, padding: spacing[3], minWidth: 100 },
  lowStockName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  lowStockQty: { fontSize: fontSize.xs, marginTop: 2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  quickBtn: { width: '47%', padding: spacing[4], alignItems: 'center', gap: spacing[2] },
  quickLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, textAlign: 'center' },
})
