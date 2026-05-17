import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import Decimal from 'decimal.js'
import { useTheme } from '../../../src/theme'
import { cashboxApi } from '../../../src/api/cashbox.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { addMoney } from '../../../src/utils/decimal.util'
import { formatDateTime } from '../../../src/utils/date.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function CashboxScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [showIn, setShowIn] = useState(false)
  const [showOut, setShowOut] = useState(false)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')

  const { data: cashbox, isLoading } = useQuery({
    queryKey: ['cashbox'],
    queryFn: cashboxApi.get,
  })

  const { data: history } = useQuery({
    queryKey: ['cashbox-history'],
    queryFn: cashboxApi.history,
  })

  const { data: todayReport } = useQuery({
    queryKey: ['cashbox-today'],
    queryFn: cashboxApi.todayReport,
  })

  const cashInMutation = useMutation({
    mutationFn: () => cashboxApi.cashIn({ amount, description: desc }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cashbox'] }); setShowIn(false); setAmount(''); setDesc(''); Toast.show({ type: 'success', text1: t('toast.saved') }) },
  })

  const cashOutMutation = useMutation({
    mutationFn: () => cashboxApi.cashOut({ amount, description: desc }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cashbox'] }); setShowOut(false); setAmount(''); setDesc(''); Toast.show({ type: 'success', text1: t('toast.saved') }) },
  })

  const openMutation = useMutation({ mutationFn: cashboxApi.open, onSuccess: () => qc.invalidateQueries({ queryKey: ['cashbox'] }) })
  const closeMutation = useMutation({ mutationFn: cashboxApi.close, onSuccess: () => qc.invalidateQueries({ queryKey: ['cashbox'] }) })

  if (isLoading) return <LoadingSkeleton />

  const total = cashbox ? addMoney(cashbox.cashBalance, cashbox.cardBalance) : new Decimal(0)

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('nav.cashbox')} showBack={false} />

      {/* Balance Cards */}
      <View style={styles.balanceRow}>
        <View style={[styles.balanceCard, { backgroundColor: colors.greenLight, flex: 1 }]}>
          <Text style={[styles.balanceLabel, { color: colors.green }]}>{t('cashbox.cash')}</Text>
          <MoneyText amount={cashbox?.cashBalance ?? '0'} bold size={fontSize.xl} color={colors.green} />
        </View>
        <View style={[styles.balanceCard, { backgroundColor: colors.blueLight, flex: 1 }]}>
          <Text style={[styles.balanceLabel, { color: colors.blue }]}>{t('cashbox.card')}</Text>
          <MoneyText amount={cashbox?.cardBalance ?? '0'} bold size={fontSize.xl} color={colors.blue} />
        </View>
      </View>
      <View style={[styles.totalRow, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('cashbox.total')}</Text>
        <MoneyText amount={total} bold size={24} color={colors.textPrimary} />
      </View>

      {/* Status */}
      <View style={[styles.statusRow, { backgroundColor: cashbox?.isOpen ? colors.greenLight : colors.redLight }]}>
        <Text style={{ color: cashbox?.isOpen ? colors.green : colors.red, fontWeight: fontWeight.semibold }}>
          {cashbox?.isOpen ? t('cashbox.sessionOpen') : t('cashbox.sessionClosed')}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setShowIn(true)} style={[styles.actionBtn, { backgroundColor: colors.greenLight, borderRadius: radius.lg }]}>
          <Text style={{ color: colors.green, fontWeight: fontWeight.bold }}>+ {t('cashbox.cashIn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowOut(true)} style={[styles.actionBtn, { backgroundColor: colors.redLight, borderRadius: radius.lg }]}>
          <Text style={{ color: colors.red, fontWeight: fontWeight.bold }}>− {t('cashbox.cashOut')}</Text>
        </TouchableOpacity>
        {cashbox?.isOpen ? (
          <TouchableOpacity onPress={() => closeMutation.mutate()} style={[styles.actionBtn, { backgroundColor: colors.amber + '30', borderRadius: radius.lg }]}>
            <Text style={{ color: colors.amber, fontWeight: fontWeight.bold }}>{t('cashbox.closeSession')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => openMutation.mutate()} style={[styles.actionBtn, { backgroundColor: colors.blueLight, borderRadius: radius.lg }]}>
            <Text style={{ color: colors.blue, fontWeight: fontWeight.bold }}>{t('cashbox.openSession')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* History */}
      <FlatList
        data={(history ?? []).slice(0, 20)}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.histRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.textPrimary, fontWeight: fontWeight.medium }]}>{item.type}</Text>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>{formatDateTime(item.createdAt)}</Text>
            </View>
            <MoneyText amount={item.cashAmount} bold color={item.type.includes('IN') || item.type === 'SALE_CASH' ? colors.green : colors.red} />
          </View>
        )}
      />

      {/* Cash In Modal */}
      <Modal visible={showIn} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>+ {t('cashbox.cashIn')}</Text>
            <MoneyInput label={t('labels.amount')} value={amount} onChangeText={setAmount} placeholder="0" />
            <FormInput label={t('labels.description')} value={desc} onChangeText={setDesc} />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowIn(false)} style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                <Text>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => cashInMutation.mutate()} disabled={!amount} style={[styles.modalBtn, { backgroundColor: colors.green, borderRadius: radius.md, opacity: !amount ? 0.5 : 1 }]}>
                <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('actions.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cash Out Modal */}
      <Modal visible={showOut} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>− {t('cashbox.cashOut')}</Text>
            <MoneyInput label={t('labels.amount')} value={amount} onChangeText={setAmount} placeholder="0" />
            <FormInput label={t('labels.description')} value={desc} onChangeText={setDesc} />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowOut(false)} style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                <Text>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => cashOutMutation.mutate()} disabled={!amount} style={[styles.modalBtn, { backgroundColor: colors.red, borderRadius: radius.md, opacity: !amount ? 0.5 : 1 }]}>
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
  balanceRow: { flexDirection: 'row', gap: spacing[3], padding: spacing[4] },
  balanceCard: { padding: spacing[4], borderRadius: radius.xl, gap: spacing[1] },
  balanceLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  totalLabel: { fontSize: fontSize.base },
  statusRow: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], padding: spacing[4] },
  actionBtn: { flex: 1, minWidth: '45%', padding: spacing[4], alignItems: 'center' },
  list: { paddingHorizontal: spacing[4], gap: spacing[2] },
  histRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: radius.md, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { padding: spacing[6], borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, gap: spacing[4] },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  modalBtns: { flexDirection: 'row', gap: spacing[3] },
  modalBtn: { flex: 1, padding: spacing[4], alignItems: 'center' },
})
