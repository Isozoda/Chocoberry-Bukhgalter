import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../../src/theme'
import { expensesApi } from '../../../src/api/expenses.api'
import { employeesApi } from '../../../src/api/employees.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { formatDate, todayISO } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import type { ExpenseType, PaymentMethod } from '../../../src/types/expense.types'

const EXPENSE_TYPES: { key: ExpenseType; label: string }[] = [
  { key: 'FIXED', label: 'Доимӣ' },
  { key: 'VARIABLE', label: 'Тағйирпазир' },
  { key: 'PAYROLL', label: 'Маош' },
  { key: 'OWNER_DRAW', label: 'Хароҷоти соҳиб' },
  { key: 'CONSUMABLE', label: 'Расходник' },
  { key: 'WASTE', label: 'Партов' },
  { key: 'FUND', label: 'Фонд' },
]

export default function ExpensesScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)
  const [deleteItem, setDeleteItem] = useState<any>(null)
  const [expType, setExpType] = useState<ExpenseType>('VARIABLE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [vendor, setVendor] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')
  const [dateStr, setDateStr] = useState(todayISO())

  const { data, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.list({ limit: 50 }),
  })

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setShowCreate(false)
      setAmount(''); setDescription(''); setVendor('')
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setDeleteItem(null)
      Toast.show({ type: 'success', text1: t('toast.deleted') })
    },
  })

  const expenses = data?.items ?? []

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header
        title={t('nav.expenses')}
        showBack={false}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[styles.addBtn, { backgroundColor: colors.brand, borderRadius: radius.md }]}
          >
            <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>+</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => setDeleteItem(item)}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.desc, { color: colors.textPrimary }]}>{item.description ?? item.expenseType}</Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
              {item.vendor && <Text style={[styles.vendor, { color: colors.textTertiary }]}>{item.vendor}</Text>}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <MoneyText amount={item.amount} bold color={colors.red} />
              <Badge label={item.paymentMethod} variant="default" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message={t('empty.noExpenses')} icon="wallet-outline" />}
      />

      <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <ScreenWrapper>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('nav.expenses')} +</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={{ color: colors.brand, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: spacing[4] }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('labels.type')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[4] }}>
              {EXPENSE_TYPES.map((et) => (
                <TouchableOpacity
                  key={et.key}
                  onPress={() => setExpType(et.key)}
                  style={[styles.chip, { backgroundColor: expType === et.key ? colors.brand : colors.surfaceAlt, borderRadius: radius.full }]}
                >
                  <Text style={{ color: expType === et.key ? '#fff' : colors.textSecondary, fontSize: fontSize.sm }}>{et.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <MoneyInput label={t('labels.amount')} value={amount} onChangeText={setAmount} placeholder="0" />
            <FormInput label={t('labels.description')} value={description} onChangeText={setDescription} />
            <FormInput label={t('labels.vendor')} value={vendor} onChangeText={setVendor} />
            <FormInput label={t('labels.date')} value={dateStr} onChangeText={setDateStr} placeholder="YYYY-MM-DD" />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('labels.type')} ({t('payment.cash')})</Text>
            <View style={styles.payRow}>
              {(['CASH', 'CARD', 'MIXED'] as PaymentMethod[]).map((pm) => (
                <TouchableOpacity
                  key={pm}
                  onPress={() => setPayMethod(pm)}
                  style={[styles.payBtn, { backgroundColor: payMethod === pm ? colors.brand : colors.surfaceAlt, borderRadius: radius.md }]}
                >
                  <Text style={{ color: payMethod === pm ? '#fff' : colors.textSecondary }}>{t(`payment.${pm.toLowerCase()}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => createMutation.mutate({ expenseType: expType, amount, description: description || undefined, vendor: vendor || undefined, paymentMethod: payMethod, date: dateStr })}
              disabled={!amount || createMutation.isPending}
              style={[styles.saveBtn, { backgroundColor: colors.brand, borderRadius: radius.lg, opacity: !amount ? 0.5 : 1 }]}
            >
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
                {createMutation.isPending ? '...' : t('actions.save')}
              </Text>
            </TouchableOpacity>
            <View style={{ height: spacing[8] }} />
          </ScrollView>
        </ScreenWrapper>
      </Modal>

      <ConfirmModal
        visible={!!deleteItem}
        title={t('confirm.delete')}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
        danger
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  addBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[3] },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: radius.lg, borderWidth: 1 },
  desc: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  date: { fontSize: fontSize.xs, marginTop: 2 },
  vendor: { fontSize: fontSize.xs },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  modalTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing[2] },
  chip: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], marginRight: spacing[2] },
  payRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  payBtn: { flex: 1, padding: spacing[3], alignItems: 'center' },
  saveBtn: { padding: spacing[4], alignItems: 'center', marginTop: spacing[4] },
})
