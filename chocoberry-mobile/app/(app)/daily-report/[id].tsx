import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../src/theme'
import { dailyReportApi } from '../../../src/api/daily-report.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { calcDailyFormula, addMoney } from '../../../src/utils/decimal.util'
import { formatDate } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function DailyReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const { data: report, isLoading } = useQuery({
    queryKey: ['daily-report', id],
    queryFn: () => dailyReportApi.getById(id),
  })

  if (isLoading || !report) return <LoadingSkeleton />

  const extraTotal = addMoney(...(report.extraIncome ?? []).map((e) => e.amount || '0').concat(['0'])).toString()
  const consumablesTotal = addMoney(...(report.consumables ?? []).map((c) => c.amount || '0').concat(['0'])).toString()
  const ownerTotal = addMoney(...(report.ownerDraws ?? []).map((o) => o.amount || '0').concat(['0'])).toString()
  const supplierTotal = addMoney(...(report.supplierPurchases ?? []).map((s) => s.amount || '0').concat(['0'])).toString()
  const formula = calcDailyFormula(report.totalSales, extraTotal, report.operationalExpenses ?? '0', consumablesTotal, ownerTotal, supplierTotal)

  const remainingColor = formula.remaining.greaterThan(0) ? colors.green : formula.remaining.equals(0) ? colors.amber : colors.red

  return (
    <ScreenWrapper>
      <Header
        title={formatDate(report.date)}
        rightAction={
          <Badge
            label={t(`status.${report.status.toLowerCase()}`)}
            variant={report.status === 'FINALIZED' ? 'success' : 'warning'}
          />
        }
      />

      <ScrollView style={{ padding: spacing[4] }}>
        {/* Formula */}
        <View style={[styles.formulaCard, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>📈 {t('dailyReport.totalIncome')}</Text>
            <MoneyText amount={formula.totalIncome} bold />
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>📉 {t('dailyReport.totalExpenses')}</Text>
            <MoneyText amount={formula.totalExpenses} bold />
          </View>
          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>🤲 {t('dailyReport.charityFund')}</Text>
            <MoneyText amount={formula.charity} bold color={colors.amber} />
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.bold }}>💰 {t('dailyReport.remaining')}</Text>
            <MoneyText amount={formula.remaining} bold size={fontSize.xl} color={remainingColor} />
          </View>
        </View>

        {/* Details */}
        <Section title={t('sales.totalSales')} color={colors}>
          <Row label={t('labels.total')} value={report.totalSales} colors={colors} money />
        </Section>

        {report.salesByLocation && report.salesByLocation.length > 0 && (
          <Section title={t('dailyReport.salesByLocation')} color={colors}>
            {report.salesByLocation.map((loc, i) => (
              <Row key={i} label={loc.name} value={loc.amount} colors={colors} money />
            ))}
          </Section>
        )}

        {report.extraIncome && report.extraIncome.length > 0 && (
          <Section title={t('dailyReport.extraIncome')} color={colors}>
            {report.extraIncome.map((ei, i) => (
              <Row key={i} label={ei.name} value={ei.amount} colors={colors} money />
            ))}
          </Section>
        )}

        <Section title={t('dailyReport.operational')} color={colors}>
          <Row label={t('labels.total')} value={report.operationalExpenses ?? '0'} colors={colors} money />
        </Section>

        {report.consumables && report.consumables.length > 0 && (
          <Section title={t('dailyReport.consumables')} color={colors}>
            {report.consumables.map((c, i) => (
              <Row key={i} label={c.employeeName} value={c.amount} colors={colors} money />
            ))}
          </Section>
        )}

        {report.ownerDraws && report.ownerDraws.length > 0 && (
          <Section title={t('dailyReport.ownerDraws')} color={colors}>
            {report.ownerDraws.map((o, i) => (
              <Row key={i} label={o.employeeName} value={o.amount} colors={colors} money />
            ))}
          </Section>
        )}

        {report.supplierPurchases && report.supplierPurchases.length > 0 && (
          <Section title={t('dailyReport.supplierPurchases')} color={colors}>
            {report.supplierPurchases.map((s, i) => (
              <Row key={i} label={s.supplierName} value={s.amount} colors={colors} money />
            ))}
          </Section>
        )}

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </ScreenWrapper>
  )
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: color.textPrimary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: color.surface, borderColor: color.border }]}>
        {children}
      </View>
    </View>
  )
}

function Row({ label, value, colors, money }: { label: string; value: string; colors: any; money?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[{ color: colors.textSecondary, flex: 1 }]}>{label}</Text>
      {money ? <MoneyText amount={value} /> : <Text style={{ color: colors.textPrimary }}>{value}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  formulaCard: { borderRadius: radius.xl, padding: spacing[5], gap: spacing[3], marginBottom: spacing[4] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: spacing[3], marginTop: spacing[1] },
  section: { marginBottom: spacing[4] },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginBottom: spacing[2] },
  sectionCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing[4], gap: spacing[3] },
})
