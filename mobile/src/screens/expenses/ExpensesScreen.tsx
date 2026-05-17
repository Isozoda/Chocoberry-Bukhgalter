import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { expensesApi } from '../../api/expenses.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'
import type { ExpenseType } from '../../types/expense.types'

type Nav = NativeStackNavigationProp<MoreStackParamList>

const EXPENSE_TYPES: { key: ExpenseType; label: string }[] = [
  { key: 'VARIABLE', label: 'Тағйирёбанда' },
  { key: 'FIXED', label: 'Доимӣ' },
  { key: 'CONSUMABLE', label: 'Истеъмолӣ' },
  { key: 'OTHER', label: 'Дигар' },
]

export function ExpensesScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [selType, setSelType] = useState<ExpenseType>('VARIABLE')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expenses', 'list'],
    queryFn: () => expensesApi.list({ limit: 30 }),
  })

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { amount: '', description: '', vendor: '' },
  })

  const createMut = useMutation({
    mutationFn: (d: any) => expensesApi.create({
      expenseType: selType, amount: Number(d.amount),
      description: d.description, vendor: d.vendor,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Хароҷот сабт шуд' })
      setAddOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })

  const getTypeLabel = (t: string) => EXPENSE_TYPES.find((e) => e.key === t)?.label ?? t

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Хароҷот" showBack
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('FixedExpenses')} style={{ padding: 4 }}>
              <Ionicons name="list-outline" size={20} color={Colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddOpen(true)} style={{ padding: 4 }}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.brand} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => (
          <Card style={styles.expenseCard}>
            <View style={styles.expenseRow}>
              <View style={styles.expenseIcon}>
                <Ionicons name="receipt-outline" size={20} color={Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.expenseTopRow}>
                  <Text style={styles.expenseDesc}>{item.description ?? item.expenseType}</Text>
                  <Badge label={getTypeLabel(item.expenseType)} variant="outline" />
                </View>
                <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
                {item.vendor && <Text style={styles.expenseVendor}>{item.vendor}</Text>}
              </View>
              <MoneyText amount={item.amount} size={FontSize.md} color={Colors.error} />
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="Хароҷот нест" />}
      />

      <BottomSheet visible={addOpen} title="Хароҷот илова кун" onClose={() => { setAddOpen(false); reset() }}>
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Навъи хароҷот</Text>
          <View style={styles.typeGrid}>
            {EXPENSE_TYPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeBtn, selType === key && styles.typeBtnActive]}
                onPress={() => setSelType(key)}
              >
                <Text style={[styles.typeBtnText, selType === key && { color: Colors.brand }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Controller control={control} name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Маблағ (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
            )}
          />
          <Controller control={control} name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Тавсиф" value={value} onChangeText={onChange} placeholder="Хароҷотро тавсиф кунед" />
            )}
          />
          <Controller control={control} name="vendor"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Фурӯшанда" value={value} onChangeText={onChange} placeholder="Ихтиёрӣ" />
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
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  expenseCard: {},
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  expenseIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },
  expenseTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  expenseDesc: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, marginRight: 8 },
  expenseDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  expenseVendor: { fontSize: FontSize.xs, color: Colors.textTertiary },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.backgroundSecondary },
  typeBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  typeBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
})
