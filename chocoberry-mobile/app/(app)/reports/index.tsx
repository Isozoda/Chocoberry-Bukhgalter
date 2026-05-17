import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../src/theme'
import { reportsApi } from '../../../src/api/reports.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { FormInput } from '../../../src/components/forms/FormInput'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import { monthKey, startOfMonth, endOfMonth, todayISO } from '../../../src/utils/date.util'
import dayjs from 'dayjs'

type ReportTab = 'profit' | 'monthly' | 'topProducts' | 'payroll'

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'profit', label: 'Фоида' },
  { key: 'monthly', label: 'Моҳона' },
  { key: 'topProducts', label: 'Беҳтарин' },
  { key: 'payroll', label: 'Маош' },
]

export default function ReportsScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [tab, setTab] = useState<ReportTab>('profit')
  const [month, setMonth] = useState(monthKey())
  const [startDate, setStartDate] = useState(startOfMonth().substring(0, 10))
  const [endDate, setEndDate] = useState(todayISO())

  const { data: profitData, isLoading: profitLoading } = useQuery({
    queryKey: ['report-profit', startDate, endDate],
    queryFn: () => reportsApi.profit({ startDate, endDate }),
    enabled: tab === 'profit',
  })

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['report-monthly', month],
    queryFn: () => reportsApi.monthly({ month }),
    enabled: tab === 'monthly',
  })

  const { data: topProducts, isLoading: topLoading } = useQuery({
    queryKey: ['report-top', startDate, endDate],
    queryFn: () => reportsApi.topProducts({ startDate, endDate, limit: 10 }),
    enabled: tab === 'topProducts',
  })

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['report-payroll', month],
    queryFn: () => reportsApi.payroll(month),
    enabled: tab === 'payroll',
  })

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('nav.reports')} showBack={false} />

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {TABS.map((tb) => (
          <TouchableOpacity
            key={tb.key}
            onPress={() => setTab(tb.key)}
            style={[styles.tabChip, { backgroundColor: tab === tb.key ? colors.brand : colors.surfaceAlt, borderRadius: radius.full }]}
          >
            <Text style={{ color: tab === tb.key ? '#fff' : colors.textSecondary, fontWeight: fontWeight.medium, fontSize: fontSize.sm }}>
              {tb.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date Filters */}
      {(tab === 'profit' || tab === 'topProducts') && (
        <View style={styles.dateRow}>
          <FormInput label={t('reports.startDate')} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" style={{ flex: 1 }} />
          <FormInput label={t('reports.endDate')} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" style={{ flex: 1 }} />
        </View>
      )}

      {(tab === 'monthly' || tab === 'payroll') && (
        <View style={styles.dateRow}>
          <FormInput label={t('reports.month')} value={month} onChangeText={setMonth} placeholder="YYYY-MM" style={{ flex: 1 }} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFIT TAB */}
        {tab === 'profit' && (
          profitLoading ? <LoadingSkeleton /> :
          <View style={styles.section}>
            {profitData && profitData.length > 0 ? profitData.map((row: any, idx: number) => (
              <View key={idx} style={[styles.profitRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.profitDate, { color: colors.textSecondary }]}>{row.date}</Text>
                <View style={styles.profitNums}>
                  <MoneyText amount={row.revenue ?? '0'} size={fontSize.sm} color={colors.green} />
                  <MoneyText amount={row.cogs ?? '0'} size={fontSize.sm} color={colors.red} />
                  <MoneyText amount={row.netProfit ?? '0'} bold color={colors.brand} />
                </View>
              </View>
            )) : <EmptyState message={t('empty.noReports')} />}
          </View>
        )}

        {/* MONTHLY TAB */}
        {tab === 'monthly' && (
          monthlyLoading ? <LoadingSkeleton /> :
          <View style={styles.section}>
            {monthlyData && (
              <>
                <View style={[styles.monthlyCard, { backgroundColor: colors.greenLight }]}>
                  <Text style={[styles.monthlyLabel, { color: colors.green }]}>{t('labels.income')}</Text>
                  <MoneyText amount={monthlyData.totalIncome ?? '0'} bold size={fontSize.xl} color={colors.green} />
                </View>
                <View style={[styles.monthlyCard, { backgroundColor: colors.redLight }]}>
                  <Text style={[styles.monthlyLabel, { color: colors.red }]}>{t('labels.expenses')}</Text>
                  <MoneyText amount={monthlyData.totalExpenses ?? '0'} bold size={fontSize.xl} color={colors.red} />
                </View>
                <View style={[styles.monthlyCard, { backgroundColor: colors.blueLight }]}>
                  <Text style={[styles.monthlyLabel, { color: colors.blue }]}>{t('labels.profit')}</Text>
                  <MoneyText amount={monthlyData.profit ?? '0'} bold size={fontSize.xl} color={colors.blue} />
                </View>
              </>
            )}
          </View>
        )}

        {/* TOP PRODUCTS TAB */}
        {tab === 'topProducts' && (
          topLoading ? <LoadingSkeleton /> :
          <View style={styles.section}>
            {topProducts && topProducts.length > 0 ? topProducts.map((p: any, idx: number) => (
              <View key={idx} style={[styles.topRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.rank, { color: colors.brand }]}>#{idx + 1}</Text>
                <Text style={[styles.topName, { color: colors.textPrimary }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[styles.topQty, { color: colors.textSecondary }]}>{p.quantity} дона</Text>
                <MoneyText amount={p.revenue} bold size={fontSize.sm} />
              </View>
            )) : <EmptyState message={t('empty.noProducts')} />}
          </View>
        )}

        {/* PAYROLL TAB */}
        {tab === 'payroll' && (
          payrollLoading ? <LoadingSkeleton /> :
          <View style={styles.section}>
            {payrollData && payrollData.length > 0 ? payrollData.map((emp: any, idx: number) => (
              <View key={idx} style={[styles.payrollRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.empName, { color: colors.textPrimary }]}>{emp.employee?.name ?? emp.name}</Text>
                <View style={styles.payrollNums}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{t('employees.baseSalary')}</Text>
                  <MoneyText amount={emp.baseSalary ?? '0'} size={fontSize.sm} />
                </View>
                <View style={styles.payrollNums}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{t('employees.finalSalary')}</Text>
                  <MoneyText amount={emp.finalSalary ?? '0'} bold color={colors.brand} />
                </View>
              </View>
            )) : <EmptyState message={t('empty.noReports')} />}
          </View>
        )}

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  tabsRow: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], gap: spacing[2] },
  tabChip: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  dateRow: { flexDirection: 'row', gap: spacing[3], paddingHorizontal: spacing[4], paddingBottom: spacing[2] },
  section: { padding: spacing[4], gap: spacing[3] },
  profitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[3], borderRadius: radius.md, borderWidth: 1 },
  profitDate: { fontSize: fontSize.sm },
  profitNums: { flexDirection: 'row', gap: spacing[3] },
  monthlyCard: { borderRadius: radius.lg, padding: spacing[5], gap: spacing[2] },
  monthlyLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  topRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: radius.md, borderWidth: 1, gap: spacing[3] },
  rank: { fontSize: fontSize.base, fontWeight: fontWeight.bold, width: 28 },
  topName: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  topQty: { fontSize: fontSize.xs },
  payrollRow: { padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[3] },
  empName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  payrollNums: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
