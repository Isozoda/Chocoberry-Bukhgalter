import React, { useState, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import Decimal from 'decimal.js'
import { useTheme } from '../../../src/theme'
import { dailyReportApi } from '../../../src/api/daily-report.api'
import { suppliersApi } from '../../../src/api/suppliers.api'
import { employeesApi } from '../../../src/api/employees.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { calcDailyFormula, addMoney, toDecimal } from '../../../src/utils/decimal.util'
import { formatDate, todayISO } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import type { DailyReport, SalesByLocation, ExtraIncome, SupplierExpense } from '../../../src/types/daily-report.types'

export default function DailyReportScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const qc = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)
  const [currentReportId, setCurrentReportId] = useState<string | null>(null)

  // Form state
  const [date, setDate] = useState(todayISO())
  const [totalSales, setTotalSales] = useState('')
  const [locations, setLocations] = useState<SalesByLocation[]>([])
  const [extraIncome, setExtraIncome] = useState<ExtraIncome[]>([])
  const [operational, setOperational] = useState('')
  const [consumables, setConsumables] = useState<{ employeeId: string; employeeName: string; amount: string }[]>([])
  const [ownerDraws, setOwnerDraws] = useState<{ employeeId: string; employeeName: string; amount: string }[]>([])
  const [supplierPurchases, setSupplierPurchases] = useState<SupplierExpense[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['daily-reports'],
    queryFn: () => dailyReportApi.list({ limit: 30 }),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  })

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.list({ limit: 100 }),
  })

  const owners = (employees ?? []).filter((e) => e.isOwner)
  const consumableBuyers = (employees ?? []).filter((e) => e.isConsumableBuyer)

  // Live formula calculation
  const formula = useMemo(() => {
    const totalSalesNum = totalSales || '0'
    const extraTotal = addMoney(...(extraIncome.map((e) => e.amount || '0').concat(['0']))).toString()
    const consumablesTotal = addMoney(...(consumables.map((c) => c.amount || '0').concat(['0']))).toString()
    const ownerTotal = addMoney(...(ownerDraws.map((o) => o.amount || '0').concat(['0']))).toString()
    const supplierTotal = addMoney(...(supplierPurchases.map((s) => s.amount || '0').concat(['0']))).toString()
    return calcDailyFormula(totalSalesNum, extraTotal, operational || '0', consumablesTotal, ownerTotal, supplierTotal)
  }, [totalSales, extraIncome, operational, consumables, ownerDraws, supplierPurchases])

  const supplierTotal = addMoney(...(supplierPurchases.map((s) => s.amount || '0').concat(['0'])))
  const suppliersMatchSales = supplierPurchases.length === 0 || supplierTotal.equals(toDecimal(totalSales || '0'))

  const createMutation = useMutation({
    mutationFn: dailyReportApi.create,
    onSuccess: (report) => {
      qc.invalidateQueries({ queryKey: ['daily-reports'] })
      setCurrentReportId(report.id)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: (id: string) => dailyReportApi.finalize(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-reports'] })
      setShowFinalize(false)
      setShowCreate(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.reportFinalized') })
    },
  })

  const handleSaveDraft = async () => {
    const consumablesArr = consumables.map((c) => ({ employeeId: c.employeeId, employeeName: c.employeeName, amount: c.amount || '0' }))
    const ownerDrawsArr = ownerDraws.map((o) => ({ employeeId: o.employeeId, employeeName: o.employeeName, amount: o.amount || '0' }))
    await createMutation.mutateAsync({
      date, totalSales: totalSales || '0',
      extraIncome: extraIncome.filter((e) => e.amount),
      operationalExpenses: operational || '0',
      consumables: consumablesArr,
      ownerDraws: ownerDrawsArr,
      supplierPurchases: supplierPurchases.filter((s) => s.amount),
      salesByLocation: locations.filter((l) => l.amount),
    })
  }

  const { isError, refetch } = useQuery({
    queryKey: ['daily-reports'],
    queryFn: () => dailyReportApi.list({ limit: 30 }),
  })

  const renderReportItem = React.useCallback(({ item }: { item: DailyReport }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/daily-report/${item.id}` as any)}
      style={[styles.reportRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.reportDate, { color: colors.textPrimary }]}>{formatDate(item.date)}</Text>
        <MoneyText amount={item.totalSales} size={fontSize.sm} color={colors.textSecondary} />
      </View>
      <MoneyText amount={item.remaining} bold />
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'FINALIZED' ? colors.greenLight : colors.amberLight }]}>
        <Text style={{ fontSize: fontSize.xs, color: item.status === 'FINALIZED' ? colors.green : colors.amber, fontWeight: fontWeight.semibold }}>
          {t(`status.${item.status.toLowerCase()}`)}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors, t, router])

  const remainingColor = formula.remaining.greaterThan(0) ? colors.green : formula.remaining.equals(0) ? colors.amber : colors.red

  if (isLoading) return <LoadingSkeleton />

  const reports = data?.items ?? []

  return (
    <ScreenWrapper scroll={false}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('dailyReport.title')}</Text>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={[styles.addBtn, { backgroundColor: colors.brand, borderRadius: radius.md }]}
        >
          <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>+ {t('dailyReport.newReport')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderReportItem}
        ListEmptyComponent={
          isError ? (
            <EmptyState message={t('errors.fetchFailed')} icon="alert-circle-outline" onRetry={refetch} retryLabel={t('actions.retry')} />
          ) : (
            <EmptyState message={t('empty.noReports')} icon="clipboard-outline" />
          )
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Create Modal */}
      <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <ScreenWrapper>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('dailyReport.newReport')}</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={{ color: colors.brand }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: spacing[4] }} showsVerticalScrollIndicator={false}>
            <FormInput label={t('labels.date')} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

            <MoneyInput label={t('dailyReport.title') + ' — ' + t('labels.total')} value={totalSales} onChangeText={setTotalSales} placeholder="0" />

            {/* Locations */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('dailyReport.salesByLocation')}</Text>
            {locations.map((loc, idx) => (
              <View key={idx} style={styles.dynRow}>
                <FormInput style={{ flex: 1 }} value={loc.name} onChangeText={(v) => { const n = [...locations]; n[idx].name = v; setLocations(n) }} placeholder={t('dailyReport.locationName')} />
                <MoneyInput style={{ flex: 1 }} value={loc.amount} onChangeText={(v) => { const n = [...locations]; n[idx].amount = v; setLocations(n) }} placeholder="0" />
                <TouchableOpacity onPress={() => setLocations(locations.filter((_, i) => i !== idx))}>
                  <Text style={{ color: colors.red, fontSize: 20 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setLocations([...locations, { name: '', amount: '0' }])} style={[styles.addRowBtn, { borderColor: colors.border }]}>
              <Text style={{ color: colors.brand }}>+ {t('dailyReport.addLocation')}</Text>
            </TouchableOpacity>

            {/* Extra Income */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('dailyReport.extraIncome')}</Text>
            {extraIncome.map((ei, idx) => (
              <View key={idx} style={styles.dynRow}>
                <FormInput style={{ flex: 1 }} value={ei.name} onChangeText={(v) => { const n = [...extraIncome]; n[idx].name = v; setExtraIncome(n) }} placeholder={t('labels.name')} />
                <MoneyInput style={{ flex: 1 }} value={ei.amount} onChangeText={(v) => { const n = [...extraIncome]; n[idx].amount = v; setExtraIncome(n) }} placeholder="0" />
                <TouchableOpacity onPress={() => setExtraIncome(extraIncome.filter((_, i) => i !== idx))}>
                  <Text style={{ color: colors.red, fontSize: 20 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setExtraIncome([...extraIncome, { name: '', amount: '0' }])} style={[styles.addRowBtn, { borderColor: colors.border }]}>
              <Text style={{ color: colors.brand }}>+ {t('actions.add')}</Text>
            </TouchableOpacity>

            <MoneyInput label={t('dailyReport.operational')} value={operational} onChangeText={setOperational} placeholder="0" />

            {/* Consumable buyers */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('dailyReport.consumables')}</Text>
            {consumableBuyers.map((emp) => {
              const current = consumables.find((c) => c.employeeId === emp.id)
              return (
                <View key={emp.id} style={styles.empRow}>
                  <Text style={{ flex: 1, color: colors.textPrimary }}>{emp.name}</Text>
                  <MoneyInput
                    style={{ flex: 1 }}
                    value={current?.amount ?? ''}
                    onChangeText={(v) => {
                      const exist = consumables.find((c) => c.employeeId === emp.id)
                      if (exist) setConsumables(consumables.map((c) => c.employeeId === emp.id ? { ...c, amount: v } : c))
                      else setConsumables([...consumables, { employeeId: emp.id, employeeName: emp.name, amount: v }])
                    }}
                    placeholder="0"
                  />
                </View>
              )
            })}

            {/* Owner draws */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('dailyReport.ownerDraws')}</Text>
            {owners.map((emp) => {
              const current = ownerDraws.find((o) => o.employeeId === emp.id)
              return (
                <View key={emp.id} style={styles.empRow}>
                  <Text style={{ flex: 1, color: colors.textPrimary }}>{emp.name}</Text>
                  <MoneyInput
                    style={{ flex: 1 }}
                    value={current?.amount ?? ''}
                    onChangeText={(v) => {
                      const exist = ownerDraws.find((o) => o.employeeId === emp.id)
                      if (exist) setOwnerDraws(ownerDraws.map((o) => o.employeeId === emp.id ? { ...o, amount: v } : o))
                      else setOwnerDraws([...ownerDraws, { employeeId: emp.id, employeeName: emp.name, amount: v }])
                    }}
                    placeholder="0"
                  />
                </View>
              )
            })}

            {/* Supplier purchases */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('dailyReport.supplierPurchases')}</Text>
            {supplierPurchases.map((sp, idx) => (
              <View key={idx} style={styles.dynRow}>
                <FormInput style={{ flex: 1 }} value={sp.supplierName} onChangeText={(v) => { const n = [...supplierPurchases]; n[idx].supplierName = v; setSupplierPurchases(n) }} placeholder={t('nav.suppliers')} />
                <MoneyInput style={{ flex: 1 }} value={sp.amount} onChangeText={(v) => { const n = [...supplierPurchases]; n[idx].amount = v; setSupplierPurchases(n) }} placeholder="0" />
                <TouchableOpacity onPress={() => setSupplierPurchases(supplierPurchases.filter((_, i) => i !== idx))}>
                  <Text style={{ color: colors.red, fontSize: 20 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setSupplierPurchases([...supplierPurchases, { supplierName: '', amount: '0' }])} style={[styles.addRowBtn, { borderColor: colors.border }]}>
              <Text style={{ color: colors.brand }}>+ {t('actions.add')}</Text>
            </TouchableOpacity>

            {/* Supplier validation */}
            {supplierPurchases.length > 0 && !suppliersMatchSales && (
              <View style={[styles.validationBanner, { backgroundColor: colors.redLight }]}>
                <Text style={{ color: colors.red, fontSize: fontSize.sm }}>
                  ⚠ {supplierTotal.toFixed(2)} ≠ {totalSales}. {t('dailyReport.sumMismatch')}: {new Decimal(totalSales || '0').minus(supplierTotal).abs().toFixed(2)} см
                </Text>
              </View>
            )}

            {/* Formula Block */}
            <View style={[styles.formulaCard, { backgroundColor: colors.surfaceAlt }]}>
              <View style={styles.formulaRow}>
                <Text style={{ color: colors.textSecondary }}>📈 {t('dailyReport.totalIncome')}</Text>
                <MoneyText amount={formula.totalIncome} bold />
              </View>
              <View style={styles.formulaRow}>
                <Text style={{ color: colors.textSecondary }}>📉 {t('dailyReport.totalExpenses')}</Text>
                <MoneyText amount={formula.totalExpenses} bold />
              </View>
              <View style={styles.formulaRow}>
                <Text style={{ color: colors.textSecondary }}>🤲 {t('dailyReport.charityFund')}</Text>
                <MoneyText amount={formula.charity} bold color={colors.amber} />
              </View>
              <View style={[styles.formulaRow, styles.formulaTotalRow]}>
                <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.bold }}>💰 {t('dailyReport.remaining')}</Text>
                <MoneyText amount={formula.remaining} bold size={fontSize.xl} color={remainingColor} />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.actionBtns}>
              <TouchableOpacity
                onPress={handleSaveDraft}
                disabled={!totalSales || createMutation.isPending}
                style={[styles.draftBtn, { borderColor: colors.brand, borderRadius: radius.lg }]}
              >
                <Text style={{ color: colors.brand, fontWeight: fontWeight.semibold }}>
                  {t('dailyReport.saveDraft')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFinalize(true)}
                disabled={!totalSales || !currentReportId || !suppliersMatchSales}
                style={[
                  styles.finalizeBtn,
                  {
                    backgroundColor: currentReportId && suppliersMatchSales ? colors.green : colors.textTertiary,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>
                  {t('actions.finalize')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: spacing[8] }} />
          </ScrollView>
        </ScreenWrapper>
      </Modal>

      <ConfirmModal
        visible={showFinalize}
        title={t('actions.finalize')}
        message={t('confirm.finalize')}
        onConfirm={() => currentReportId && finalizeMutation.mutate(currentReportId)}
        onCancel={() => setShowFinalize(false)}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  addBtn: { padding: spacing[3], paddingHorizontal: spacing[4] },
  list: { padding: spacing[4], gap: spacing[3] },
  reportRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[3] },
  reportDate: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  statusBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.sm },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  modalTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  sectionLabel: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginTop: spacing[4], marginBottom: spacing[2] },
  dynRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  addRowBtn: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing[3], alignItems: 'center', marginBottom: spacing[4] },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] },
  validationBanner: { borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[3] },
  formulaCard: { borderRadius: radius.xl, padding: spacing[5], gap: spacing[3], marginVertical: spacing[4] },
  formulaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formulaTotalRow: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: spacing[3], marginTop: spacing[1] },
  actionBtns: { flexDirection: 'row', gap: spacing[3] },
  draftBtn: { flex: 1, borderWidth: 1.5, padding: spacing[4], alignItems: 'center' },
  finalizeBtn: { flex: 1, padding: spacing[4], alignItems: 'center' },
})
