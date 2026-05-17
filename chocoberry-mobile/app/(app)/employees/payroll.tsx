import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../../src/theme'
import { employeesApi } from '../../../src/api/employees.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import { todayISO } from '../../../src/utils/date.util'

export default function PayrollCalculationScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [showConfirm, setShowConfirm] = useState(false)
  const currentMonth = todayISO().slice(0, 7)

  const { data: results, isLoading } = useQuery({
    queryKey: ['payroll-calculation', currentMonth],
    queryFn: () => employeesApi.calculatePayroll({ month: currentMonth, applyNow: false }),
  })

  const applyMutation = useMutation({
    mutationFn: () => employeesApi.calculatePayroll({ month: currentMonth, applyNow: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee-payments'] })
      setShowConfirm(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.payrollApplied') })
    },
  })

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('employees.monthlyPayroll')} />

      <View style={[styles.infoBox, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t('employees.payrollInfo', { month: currentMonth })}
        </Text>
      </View>

      <FlatList
        data={results ?? []}
        keyExtractor={(item) => item.employeeId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.empName, { color: colors.textPrimary }]}>{item.employee.name}</Text>
              <MoneyText amount={item.finalSalary} bold color={colors.brand} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('labels.salary')}:</Text>
                <MoneyText amount={item.baseSalary} size={fontSize.xs} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('labels.bonus')}:</Text>
                <MoneyText amount={item.bonusAmount} size={fontSize.xs} color={colors.green} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('employees.fines')}:</Text>
                <MoneyText amount={item.totalFines} size={fontSize.xs} color={colors.red} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('employees.advances')}:</Text>
                <MoneyText amount={item.totalAdvances} size={fontSize.xs} color={colors.amber} />
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setShowConfirm(true)}
          style={[styles.applyBtn, { backgroundColor: colors.brand, borderRadius: radius.lg }]}
        >
          <Text style={styles.applyBtnText}>{t('employees.applyPayroll')}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showConfirm}
        title={t('employees.applyPayroll')}
        message={t('confirm.applyPayroll', { month: currentMonth })}
        onConfirm={() => applyMutation.mutate()}
        onCancel={() => setShowConfirm(false)}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  infoBox: { padding: spacing[4], margin: spacing[4], borderRadius: radius.md },
  infoText: { fontSize: fontSize.sm, textAlign: 'center' },
  list: { padding: spacing[4], gap: spacing[3] },
  card: { padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, gap: spacing[2] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empName: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  cardBody: { marginTop: spacing[1], gap: 2 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: fontSize.xs, color: '#9CA3AF' },
  footer: { padding: spacing[4] },
  applyBtn: { padding: spacing[4], alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
})
