import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useTheme } from '../../../src/theme'
import { fundsApi } from '../../../src/api/funds.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import type { Fund, FundType } from '../../../src/types/fund.types'

const FUND_CONFIG: Record<FundType, { emoji: string; color: string; bgKey: string }> = {
  CHARITY: { emoji: '🤲', color: '#F59E0B', bgKey: 'amberLight' },
  RESERVE: { emoji: '🏦', color: '#3B82F6', bgKey: 'blueLight' },
  RENOVATION: { emoji: '🏗', color: '#8B5CF6', bgKey: 'purpleLight' },
  EMERGENCY: { emoji: '🚨', color: '#EF4444', bgKey: 'redLight' },
  TAX_RESERVE: { emoji: '📊', color: '#22C55E', bgKey: 'greenLight' },
}

export default function FundsScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  const { data: funds, isLoading } = useQuery({
    queryKey: ['funds'],
    queryFn: fundsApi.list,
  })

  const depositMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => fundsApi.deposit(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funds'] })
      setSelectedFund(null); setAmount(''); setNotes('')
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => fundsApi.withdraw(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funds'] })
      setSelectedFund(null); setAmount(''); setNotes('')
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  const handleTransaction = () => {
    if (!selectedFund || !amount) return
    const fn = txType === 'deposit' ? depositMutation : withdrawMutation
    fn.mutate({ id: selectedFund.id, dto: { amount, notes: notes || undefined } })
  }

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('nav.funds')} showBack={false} />

      <FlatList
        data={funds ?? []}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: fund }) => {
          const cfg = FUND_CONFIG[fund.type as FundType] ?? { emoji: '💰', color: colors.brand, bgKey: 'brandLight' }
          const bgColor = (colors as any)[cfg.bgKey] ?? colors.surfaceAlt
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
                  <Text style={styles.emoji}>{cfg.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fundName, { color: colors.textPrimary }]}>{fund.name}</Text>
                  <MoneyText amount={fund.balance} bold size={fontSize.xl} color={cfg.color} />
                </View>
              </View>
              <View style={styles.cardBtns}>
                <TouchableOpacity
                  onPress={() => { setSelectedFund(fund); setTxType('deposit') }}
                  style={[styles.txBtn, { backgroundColor: colors.greenLight, borderRadius: radius.md }]}
                >
                  <Text style={{ color: colors.green, fontWeight: fontWeight.semibold }}>+ {t('funds.deposit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setSelectedFund(fund); setTxType('withdraw') }}
                  style={[styles.txBtn, { backgroundColor: colors.redLight, borderRadius: radius.md }]}
                >
                  <Text style={{ color: colors.red, fontWeight: fontWeight.semibold }}>− {t('funds.withdraw')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />

      <Modal visible={!!selectedFund} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {txType === 'deposit' ? t('funds.deposit') : t('funds.withdraw')} — {selectedFund?.name}
            </Text>
            <MoneyInput label={t('labels.amount')} value={amount} onChangeText={setAmount} placeholder="0" />
            <FormInput label={t('labels.notes')} value={notes} onChangeText={setNotes} />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setSelectedFund(null)} style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                <Text>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTransaction}
                disabled={!amount}
                style={[styles.modalBtn, { backgroundColor: txType === 'deposit' ? colors.green : colors.red, borderRadius: radius.md, opacity: !amount ? 0.5 : 1 }]}
              >
                <Text style={{ color: '#fff', fontWeight: fontWeight.bold }}>{t('actions.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  list: { padding: spacing[4], gap: spacing[3] },
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing[5], gap: spacing[4] },
  cardTop: { flexDirection: 'row', gap: spacing[4], alignItems: 'center' },
  iconWrap: { width: 52, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  fundName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginBottom: 4 },
  cardBtns: { flexDirection: 'row', gap: spacing[3] },
  txBtn: { flex: 1, padding: spacing[3], alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { padding: spacing[6], borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, gap: spacing[4] },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  modalBtns: { flexDirection: 'row', gap: spacing[3] },
  modalBtn: { flex: 1, padding: spacing[4], alignItems: 'center' },
})
