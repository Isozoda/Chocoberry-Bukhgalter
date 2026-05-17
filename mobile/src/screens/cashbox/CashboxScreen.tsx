import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { cashboxApi } from '../../api/cashbox.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { formatDateTime } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { CashboxOperationType } from '../../types/cashbox.types'

type OpType = 'IN' | 'OUT'

export function CashboxScreen() {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [opOpen, setOpOpen] = useState(false)
  const [opType, setOpType] = useState<OpType>('IN')

  const { data: balance, refetch: r1 } = useQuery({
    queryKey: ['cashbox', 'balance'],
    queryFn: cashboxApi.getBalance,
  })

  const { data: today, isLoading, refetch: r2 } = useQuery({
    queryKey: ['cashbox', 'today'],
    queryFn: cashboxApi.getTodayReport,
  })

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { amount: '', description: '' },
  })

  const opMut = useMutation({
    mutationFn: (d: any) => cashboxApi.operation({
      type: opType as CashboxOperationType,
      amount: d.amount,
      description: d.description,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: `${opType === 'IN' ? 'Дохилшавӣ' : 'Хуруҷ'} сабт шуд` })
      setOpOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['cashbox'] })
    },
  })

  const getOpIcon = (type: string) => {
    if (type.includes('IN') || type === 'OPEN') return 'arrow-down-circle-outline'
    return 'arrow-up-circle-outline'
  }

  const getOpColor = (type: string) => {
    if (type.includes('IN') || type === 'OPEN') return Colors.success
    return Colors.error
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Касса" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { r1(); r2() }} tintColor={Colors.brand} />}
      >
        {/* Balance Cards */}
        <View style={styles.balanceGrid}>
          <Card style={styles.balanceCard}>
            <View style={[styles.balanceIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="cash-outline" size={24} color={Colors.success} />
            </View>
            <Text style={styles.balanceLabel}>Нақд</Text>
            <MoneyText amount={balance?.cashBalance ?? '0'} size={FontSize.xl} color={Colors.success} />
          </Card>
          <Card style={styles.balanceCard}>
            <View style={[styles.balanceIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="card-outline" size={24} color={Colors.info} />
            </View>
            <Text style={styles.balanceLabel}>Корт</Text>
            <MoneyText amount={balance?.cardBalance ?? '0'} size={FontSize.xl} color={Colors.info} />
          </Card>
        </View>

        <Card>
          <Text style={styles.totalLabel}>Ҳамагӣ</Text>
          <MoneyText amount={balance?.totalBalance ?? '0'} size={FontSize.xxxl} color={Colors.brand} />
        </Card>

        {/* Today Summary */}
        {today && (
          <Card>
            <Text style={styles.sectionTitle}>📊 Имрӯз</Text>
            <View style={styles.todayGrid}>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>Дохилшавӣ</Text>
                <MoneyText amount={today.totalIn} size={FontSize.md} color={Colors.success} />
              </View>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>Хуруҷ</Text>
                <MoneyText amount={today.totalOut} size={FontSize.md} color={Colors.error} />
              </View>
              <View style={styles.todayItem}>
                <Text style={styles.todayLabel}>Тағйир</Text>
                <MoneyText amount={today.netChange} size={FontSize.md} color={Number(today.netChange) >= 0 ? Colors.success : Colors.error} />
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          <Button
            title="↓ Нақд дохил"
            onPress={() => { setOpType('IN'); setOpOpen(true) }}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title="↑ Нақд хориҷ"
            onPress={() => { setOpType('OUT'); setOpOpen(true) }}
            variant="danger"
            style={{ flex: 1 }}
          />
        </View>

        {/* Operations */}
        {today && today.operations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Амалиётҳои имрӯз</Text>
            {today.operations.slice(0, 10).map((op) => (
              <Card key={op.id} style={styles.opCard}>
                <View style={styles.opRow}>
                  <View style={[styles.opIcon, { backgroundColor: `${getOpColor(op.type)}18` }]}>
                    <Ionicons name={getOpIcon(op.type) as any} size={18} color={getOpColor(op.type)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opType}>{op.type}</Text>
                    <Text style={styles.opTime}>{formatDateTime(op.createdAt)}</Text>
                    {op.description && <Text style={styles.opDesc}>{op.description}</Text>}
                  </View>
                  <MoneyText amount={op.amount} size={FontSize.md} color={getOpColor(op.type)} />
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <BottomSheet
        visible={opOpen}
        title={opType === 'IN' ? 'Нақд дохил' : 'Нақд хориҷ'}
        onClose={() => { setOpOpen(false); reset() }}
      >
        <View style={styles.form}>
          <Controller control={control} name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Маблағ (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
            )}
          />
          <Controller control={control} name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Тавсиф" value={value} onChangeText={onChange} placeholder="Ихтиёрӣ" />
            )}
          />
          <Button
            title={opMut.isPending ? 'Сабт шудан...' : 'Сабт кун'}
            onPress={handleSubmit((d) => opMut.mutate(d))}
            loading={opMut.isPending}
            variant={opType === 'OUT' ? 'danger' : 'primary'}
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
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  balanceGrid: { flexDirection: 'row', gap: Spacing.sm },
  balanceCard: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  balanceIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  balanceLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  todayGrid: { flexDirection: 'row', gap: Spacing.md },
  todayItem: { flex: 1, alignItems: 'center' },
  todayLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  opCard: { padding: Spacing.md },
  opRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  opIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  opType: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  opTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  opDesc: { fontSize: FontSize.xs, color: Colors.textTertiary },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
})
