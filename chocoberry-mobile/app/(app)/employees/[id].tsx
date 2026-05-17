import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../../src/theme'
import { employeesApi } from '../../../src/api/employees.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { formatDate, todayISO } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

type Tab = 'info' | 'payments' | 'fines' | 'payroll'

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('info')
  const [showPay, setShowPay] = useState(false)
  const [showFine, setShowFine] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [fineAmount, setFineAmount] = useState('')
  const [fineReason, setFineReason] = useState('')
  const [fineDate, setFineDate] = useState(todayISO())

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(id),
  })

  const { data: payments } = useQuery({
    queryKey: ['employee-payments', id],
    queryFn: () => employeesApi.getPayments(id),
    enabled: tab === 'payments',
  })

  const { data: fines } = useQuery({
    queryKey: ['employee-fines', id],
    queryFn: () => employeesApi.getFines(id),
    enabled: tab === 'fines',
  })

  const { data: payroll } = useQuery({
    queryKey: ['employee-payroll', id, todayISO().slice(0, 7)],
    queryFn: () => employeesApi.getPayroll(id, todayISO().slice(0, 7)),
    enabled: tab === 'payroll',
  })

  const payMutation = useMutation({
    mutationFn: () => employeesApi.pay(id, { type: 'ADVANCE', amount: payAmount, notes: payNotes || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee-payments', id] })
      setShowPay(false); setPayAmount(''); setPayNotes('')
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  const fineMutation = useMutation({
    mutationFn: () => employeesApi.createFine(id, { amount: fineAmount, reason: fineReason, date: fineDate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee-fines', id] })
      setShowFine(false); setFineAmount(''); setFineReason('')
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  if (isLoading || !employee) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header title={employee.name} />

      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.brandLight }]}>
          <Text style={[styles.avatarText, { color: colors.brand }]}>{employee.name[0]}</Text>
        </View>
        <View>
          <Text style={[styles.position, { color: colors.textSecondary }]}>{employee.position}</Text>
          <View style={styles.badgeRow}>
            {employee.isOwner && <Badge label={t('employees.isOwner')} variant="warning" />}
            {employee.isConsumableBuyer && <Badge label="Расходник" variant="info" />}
          </View>
          <MoneyText amount={employee.baseSalary} bold size={fontSize.lg} />
        </View>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {([
          ['info', t('labels.total')],
          ['payments', t('employees.payments')],
          ['fines', t('employees.fines')],
          ['payroll', t('employees.payroll')]
        ] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={[styles.tab, { borderBottomColor: tab === key ? colors.brand : 'transparent' }]}>
            <Text style={{ color: tab === key ? colors.brand : colors.textSecondary, fontWeight: fontWeight.medium, fontSize: fontSize.xs }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'info' && (
        <ScrollView style={{ padding: spacing[4] }}>
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.infoRow}>
              <Text style={{ color: colors.textSecondary }}>{t('labels.salary')}</Text>
              <MoneyText amount={employee.baseSalary} bold />
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: colors.textSecondary }}>{t('labels.bonus')}</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>{employee.bonusPercentage}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: colors.textSecondary }}>{t('employees.hiredAt')}</Text>
              <Text style={{ color: colors.textPrimary }}>{formatDate(employee.hiredAt)}</Text>
            </View>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity onPress={() => setShowPay(true)} style={[styles.actionBtn, { backgroundColor: colors.green, borderRadius: radius.lg }]}>
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('employees.addPayment')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFine(true)} style={[styles.actionBtn, { backgroundColor: colors.red, borderRadius: radius.lg }]}>
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('employees.addFine')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {tab === 'payments' && (
        <FlatList
          data={payments ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message={t('empty.noData')} />}
          renderItem={({ item }) => (
            <View style={[styles.listRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Badge label={item.type} variant="info" />
                {item.period && <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.period}</Text>}
              </View>
              <MoneyText amount={item.amount} bold />
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>{formatDate(item.createdAt)}</Text>
            </View>
          )}
        />
      )}

      {tab === 'fines' && (
        <FlatList
          data={fines ?? []}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message={t('empty.noData')} />}
          renderItem={({ item }) => (
            <View style={[styles.listRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.medium }}>{item.reason}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{formatDate(item.date)}</Text>
              </View>
              <MoneyText amount={item.amount} bold color={colors.red} />
              <Badge label={item.isApplied ? t('status.applied') : t('status.pending')} variant={item.isApplied ? 'success' : 'warning'} />
            </View>
          )}
        />
      )}

      {tab === 'payroll' && payroll && (
        <ScrollView style={{ padding: spacing[4] }}>
          <View style={[styles.payrollCard, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.payrollRow}>
              <Text style={{ color: colors.textSecondary }}>{t('labels.salary')}</Text>
              <MoneyText amount={payroll.baseSalary} bold />
            </View>
            <View style={styles.payrollRow}>
              <Text style={{ color: colors.textSecondary }}>{t('labels.bonus')}</Text>
              <MoneyText amount={payroll.bonusAmount} bold color={colors.green} />
            </View>
            <View style={styles.payrollRow}>
              <Text style={{ color: colors.textSecondary }}>{t('employees.fines')}</Text>
              <MoneyText amount={payroll.totalFines} bold color={colors.red} />
            </View>
            <View style={styles.payrollRow}>
              <Text style={{ color: colors.textSecondary }}>{t('employees.advances')}</Text>
              <MoneyText amount={payroll.totalAdvances} bold color={colors.amber} />
            </View>
            <View style={[styles.payrollRow, styles.payrollTotalRow, { borderTopColor: colors.border }]}>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.lg }}>{t('labels.total')}</Text>
              <MoneyText amount={payroll.finalSalary} bold size={fontSize.xl} color={colors.brand} />
            </View>
          </View>
          
          <Text style={[styles.payrollNote, { color: colors.textSecondary }]}>
            * {t('employees.payrollNote', { month: todayISO().slice(0, 7) })}
          </Text>
        </ScrollView>
      )}

      {/* Pay Modal */}
      <Modal visible={showPay} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('employees.addPayment')}</Text>
            <MoneyInput label={t('labels.amount')} value={payAmount} onChangeText={setPayAmount} placeholder="0" />
            <FormInput label={t('labels.notes')} value={payNotes} onChangeText={setPayNotes} />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowPay(false)} style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                <Text style={{ color: colors.textPrimary }}>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => payMutation.mutate()} disabled={!payAmount} style={[styles.modalBtn, { backgroundColor: colors.green, borderRadius: radius.md, opacity: !payAmount ? 0.5 : 1 }]}>
                <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('actions.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fine Modal */}
      <Modal visible={showFine} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('employees.addFine')}</Text>
            <MoneyInput label={t('labels.amount')} value={fineAmount} onChangeText={setFineAmount} placeholder="0" />
            <FormInput label={t('labels.description')} value={fineReason} onChangeText={setFineReason} />
            <FormInput label={t('labels.date')} value={fineDate} onChangeText={setFineDate} />
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{t('employees.fineApplied')}</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowFine(false)} style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                <Text style={{ color: colors.textPrimary }}>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => fineMutation.mutate()} disabled={!fineAmount || !fineReason} style={[styles.modalBtn, { backgroundColor: colors.red, borderRadius: radius.md, opacity: (!fineAmount || !fineReason) ? 0.5 : 1 }]}>
                <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('actions.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', padding: spacing[4], gap: spacing[4], alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: fontWeight.bold },
  position: { fontSize: fontSize.sm },
  badgeRow: { flexDirection: 'row', gap: spacing[2], marginTop: 4, marginBottom: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, padding: spacing[3], alignItems: 'center', borderBottomWidth: 2 },
  infoCard: { borderRadius: radius.lg, padding: spacing[4], gap: spacing[3] },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBtns: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[4] },
  actionBtn: { flex: 1, padding: spacing[4], alignItems: 'center' },
  list: { padding: spacing[4], gap: spacing[3] },
  listRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[3] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { padding: spacing[6], borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, gap: spacing[4] },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  modalBtns: { flexDirection: 'row', gap: spacing[3] },
  modalBtn: { flex: 1, padding: spacing[4], alignItems: 'center' },
  payrollCard: { borderRadius: radius.lg, padding: spacing[5], gap: spacing[4] },
  payrollRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payrollTotalRow: { borderTopWidth: 1, paddingTop: spacing[4], marginTop: spacing[2] },
  payrollNote: { fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing[4], paddingHorizontal: spacing[4] },
})
