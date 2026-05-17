import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { fundsApi } from '../../api/funds.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { EmptyState } from '../../components/ui/EmptyState'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { FundType } from '../../types/fund.types'

const FUND_TYPES: { key: FundType; label: string; icon: string; color: string }[] = [
  { key: 'CHARITY', label: 'Хайрия', icon: '🕌', color: Colors.success },
  { key: 'RESERVE', label: 'Захира', icon: '🏦', color: Colors.info },
  { key: 'EMERGENCY', label: 'Фавқулода', icon: '🚨', color: Colors.error },
  { key: 'RENOVATION', label: 'Таъмир', icon: '🔧', color: Colors.warning },
  { key: 'TAX_RESERVE', label: 'Андоз', icon: '📊', color: Colors.violet },
  { key: 'OTHER', label: 'Дигар', icon: '💼', color: Colors.textSecondary },
]

export function FundsScreen() {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [txOpen, setTxOpen] = useState<{ fundId: string; name: string; type: 'deposit' | 'withdraw' } | null>(null)
  const [selType, setSelType] = useState<FundType>('CHARITY')

  const { data: funds = [], isLoading, refetch } = useQuery({
    queryKey: ['funds'],
    queryFn: fundsApi.list,
  })

  const { control: cc, handleSubmit: hsc, reset: rc } = useForm({ defaultValues: { name: '' } })
  const { control: tc, handleSubmit: hst, reset: rt } = useForm({ defaultValues: { amount: '', notes: '' } })

  const createMut = useMutation({
    mutationFn: (d: any) => fundsApi.create({ type: selType, name: d.name }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Фонд эҷод шуд' })
      setCreateOpen(false); rc()
      queryClient.invalidateQueries({ queryKey: ['funds'] })
    },
  })

  const txMut = useMutation({
    mutationFn: (d: any) => {
      if (!txOpen) return Promise.reject()
      const fn = txOpen.type === 'deposit' ? fundsApi.deposit : fundsApi.withdraw
      return fn(txOpen.fundId, { amount: d.amount, notes: d.notes })
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Амалиёт сабт шуд' })
      setTxOpen(null); rt()
      queryClient.invalidateQueries({ queryKey: ['funds'] })
    },
  })

  const getFundType = (type: FundType) => FUND_TYPES.find((f) => f.key === type) ?? FUND_TYPES[5]

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Фондҳо" showBack
        right={
          <TouchableOpacity onPress={() => setCreateOpen(true)} style={{ padding: 4 }}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={funds}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => {
          const typeInfo = getFundType(item.type)
          return (
            <Card style={styles.fundCard}>
              <View style={styles.fundHeader}>
                <Text style={{ fontSize: 24 }}>{typeInfo.icon}</Text>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.fundName}>{item.name}</Text>
                  <Text style={[styles.fundType, { color: typeInfo.color }]}>{typeInfo.label}</Text>
                </View>
                <MoneyText amount={item.balance} size={FontSize.xl} color={typeInfo.color} />
              </View>
              <View style={styles.fundActions}>
                <TouchableOpacity
                  style={[styles.fundBtn, { backgroundColor: Colors.successLight }]}
                  onPress={() => { setTxOpen({ fundId: item.id, name: item.name, type: 'deposit' }); rt() }}
                >
                  <Ionicons name="arrow-down" size={14} color={Colors.success} />
                  <Text style={[styles.fundBtnText, { color: Colors.success }]}>Ворид</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fundBtn, { backgroundColor: Colors.errorLight }]}
                  onPress={() => { setTxOpen({ fundId: item.id, name: item.name, type: 'withdraw' }); rt() }}
                >
                  <Ionicons name="arrow-up" size={14} color={Colors.error} />
                  <Text style={[styles.fundBtnText, { color: Colors.error }]}>Баровар</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )
        }}
        ListEmptyComponent={<EmptyState icon="shield-checkmark-outline" title="Фонд нест" />}
      />

      {/* Create Fund Sheet */}
      <BottomSheet visible={createOpen} title="Фонд эҷод кун" onClose={() => { setCreateOpen(false); rc() }}>
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Навъи фонд</Text>
          <View style={styles.typeGrid}>
            {FUND_TYPES.map(({ key, label, icon, color }) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeBtn, selType === key && { borderColor: color, backgroundColor: `${color}18` }]}
                onPress={() => setSelType(key)}
              >
                <Text>{icon}</Text>
                <Text style={[styles.typeBtnText, selType === key && { color }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Controller control={cc} name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Ном" value={value} onChangeText={onChange} placeholder="Номи фонд" autoCapitalize="words" />
            )}
          />
          <Button
            title={createMut.isPending ? 'Эҷод шудан...' : 'Эҷод кун'}
            onPress={hsc((d) => createMut.mutate(d))}
            loading={createMut.isPending}
            fullWidth
            style={{ marginBottom: Spacing.xxl }}
          />
        </View>
      </BottomSheet>

      {/* Transaction Sheet */}
      <BottomSheet
        visible={!!txOpen}
        title={txOpen?.type === 'deposit' ? `Ворид — ${txOpen?.name}` : `Баровар — ${txOpen?.name}`}
        onClose={() => { setTxOpen(null); rt() }}
      >
        <View style={styles.form}>
          <Controller control={tc} name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Маблағ (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
            )}
          />
          <Controller control={tc} name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Эзоҳ" value={value} onChangeText={onChange} placeholder="Ихтиёрӣ" />
            )}
          />
          <Button
            title={txMut.isPending ? 'Сабт шудан...' : 'Сабт кун'}
            onPress={hst((d) => txMut.mutate(d))}
            loading={txMut.isPending}
            variant={txOpen?.type === 'withdraw' ? 'danger' : 'primary'}
            fullWidth
            style={{ marginBottom: Spacing.xxl }}
          />
        </View>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  fundCard: { gap: Spacing.md },
  fundHeader: { flexDirection: 'row', alignItems: 'center' },
  fundName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  fundType: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  fundActions: { flexDirection: 'row', gap: Spacing.sm },
  fundBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: Radius.md },
  fundBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.backgroundSecondary, flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
})
