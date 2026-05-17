import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { fixedExpensesApi } from '../../api/fixed-expenses.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'

const currentMonth = dayjs().format('YYYY-MM')

export function FixedExpensesScreen() {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['fixed-expenses', currentMonth],
    queryFn: () => fixedExpensesApi.list({ month: currentMonth }),
  })

  const { data: summary } = useQuery({
    queryKey: ['fixed-expenses', 'summary', currentMonth],
    queryFn: () => fixedExpensesApi.summary(currentMonth),
  })

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { name: '', category: 'Ижора', amount: '', dueDate: dayjs().format('YYYY-MM-DD') },
  })

  const createMut = useMutation({
    mutationFn: (d: any) => fixedExpensesApi.create({
      name: d.name, category: d.category,
      amount: Number(d.amount), period: 'MONTHLY', dueDate: d.dueDate,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Хароҷот сабт шуд' })
      setAddOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] })
    },
  })

  const markPaidMut = useMutation({
    mutationFn: (id: string) => fixedExpensesApi.markPaid(id),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Пардохт қайд шуд' })
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] })
    },
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Хароҷоти доимӣ" showBack
        right={
          <TouchableOpacity onPress={() => setAddOpen(true)} style={{ padding: 4 }}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        ListHeaderComponent={
          summary ? (
            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { backgroundColor: Colors.successLight }]}>
                <Text style={styles.summaryLabel}>Пардохта</Text>
                <MoneyText amount={summary.totalPaid} size={FontSize.lg} color={Colors.success} />
              </View>
              <View style={[styles.summaryItem, { backgroundColor: Colors.warningLight }]}>
                <Text style={styles.summaryLabel}>Интизор</Text>
                <MoneyText amount={summary.totalPending} size={FontSize.lg} color={Colors.warning} />
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.expenseCard}>
            <View style={styles.expenseRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <Text style={styles.expenseName}>{item.name}</Text>
                  <Badge label={item.isPaid ? 'Пардохта' : 'Интизор'} variant={item.isPaid ? 'success' : 'warning'} />
                </View>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.dueDate}>Мӯҳлат: {item.dueDate}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <MoneyText amount={item.amount} size={FontSize.md} color={Colors.text} />
                {!item.isPaid && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => markPaidMut.mutate(item.id)}
                  >
                    <Text style={styles.payBtnText}>Пардохт</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState icon="list-outline" title="Хароҷоти доимӣ нест" />}
      />

      <BottomSheet visible={addOpen} title="Хароҷоти доимӣ илова кун" onClose={() => { setAddOpen(false); reset() }}>
        <View style={styles.form}>
          <Controller control={control} name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Ном" value={value} onChangeText={onChange} placeholder="Ижора, Маош..." autoCapitalize="words" />
            )}
          />
          <Controller control={control} name="category"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Навъ" value={value} onChangeText={onChange} placeholder="Ижора, Коммуналӣ..." />
            )}
          />
          <Controller control={control} name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Маблағ (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
            )}
          />
          <Button
            title={createMut.isPending ? 'Сабт шудан...' : 'Сабт кун'}
            onPress={handleSubmit((d) => createMut.mutate(d))}
            loading={createMut.isPending}
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
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryItem: { flex: 1, borderRadius: 12, padding: Spacing.md },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  expenseCard: {},
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  expenseName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, marginRight: 8 },
  category: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  dueDate: { fontSize: FontSize.xs, color: Colors.textTertiary },
  payBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.successLight },
  payBtnText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.semibold },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
})
