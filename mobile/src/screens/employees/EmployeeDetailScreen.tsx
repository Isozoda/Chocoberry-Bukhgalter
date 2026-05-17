import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRoute, type RouteProp } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { employeesApi } from '../../api/employees.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { StaffStackParamList } from '../../navigation/types'
import type { PaymentType } from '../../types/employee.types'

type Route = RouteProp<StaffStackParamList, 'EmployeeDetail'>

const PAY_TYPES: { key: PaymentType; label: string }[] = [
  { key: 'SALARY', label: 'Маош' },
  { key: 'ADVANCE', label: 'Пешпардохт' },
  { key: 'BONUS', label: 'Бонус' },
  { key: 'FINE', label: 'Ҷарима' },
]

export function EmployeeDetailScreen() {
  const insets = useSafeAreaInsets()
  const { params } = useRoute<Route>()
  const queryClient = useQueryClient()
  const [payOpen, setPayOpen] = useState(false)
  const [fineOpen, setFineOpen] = useState(false)
  const [payType, setPayType] = useState<PaymentType>('SALARY')
  const [amount, setAmount] = useState('')
  const [fineAmount, setFineAmount] = useState('')
  const [fineReason, setFineReason] = useState('')

  const currentMonth = dayjs().format('YYYY-MM')

  const { data: employee, isLoading, refetch } = useQuery({
    queryKey: ['employees', params.id],
    queryFn: () => employeesApi.getById(params.id),
  })

  const { data: payroll } = useQuery({
    queryKey: ['employees', params.id, 'payroll', currentMonth],
    queryFn: () => employeesApi.getPayroll(params.id, currentMonth),
    retry: false,
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['employees', params.id, 'payments'],
    queryFn: () => employeesApi.getPayments(params.id),
  })

  const payMut = useMutation({
    mutationFn: () => employeesApi.pay(params.id, { paymentType: payType, amount: Number(amount) }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Пардохт иҷро шуд' })
      setPayOpen(false); setAmount('')
      queryClient.invalidateQueries({ queryKey: ['employees', params.id] })
    },
  })

  const fineMut = useMutation({
    mutationFn: () => employeesApi.createFine(params.id, { amount: Number(fineAmount), reason: fineReason }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Ҷарима илова шуд' })
      setFineOpen(false); setFineAmount(''); setFineReason('')
      queryClient.invalidateQueries({ queryKey: ['employees', params.id] })
    },
  })

  if (!employee) return null

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={employee.name} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        {/* Profile Card */}
        <Card>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{employee.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>{employee.name}</Text>
              <Text style={styles.empRole}>{employee.role}</Text>
              <View style={styles.tagsRow}>
                <Badge label={employee.isActive ? 'Фаъол' : 'Ғайрифаъол'} variant={employee.isActive ? 'success' : 'default'} />
                {employee.isOwner && <Badge label="Соҳиб" variant="warning" />}
              </View>
            </View>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Маош</Text>
              <MoneyText amount={employee.salary} size={FontSize.lg} color={Colors.brand} />
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Навъ</Text>
              <Text style={styles.detailVal}>{employee.salaryType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Бонус</Text>
              <Text style={styles.detailVal}>{employee.bonusPercent}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Истихдом</Text>
              <Text style={styles.detailVal}>{formatDate(employee.hireDate)}</Text>
            </View>
          </View>
        </Card>

        {/* Monthly Payroll */}
        {payroll && (
          <Card>
            <Text style={styles.sectionTitle}>Ҳисобӣ — {currentMonth}</Text>
            <View style={styles.payrollGrid}>
              {[
                { label: 'Маоши асос', value: payroll.baseSalary },
                { label: 'Бонус', value: payroll.bonus, color: Colors.success },
                { label: 'Ҷаримаҳо', value: payroll.fines, color: Colors.error },
                { label: 'Пешпардохтҳо', value: payroll.advances, color: Colors.warning },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.payrollItem}>
                  <Text style={styles.payrollLabel}>{label}</Text>
                  <MoneyText amount={value} size={FontSize.sm} color={color ?? Colors.text} />
                </View>
              ))}
            </View>
            <View style={styles.finalPayRow}>
              <Text style={styles.finalPayLabel}>Ниҳоии маош</Text>
              <MoneyText amount={payroll.finalSalary} size={FontSize.xl} color={Colors.brand} />
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionBtns}>
          <Button title="💸 Пардохт кун" onPress={() => setPayOpen(true)} style={{ flex: 1 }} />
          <Button title="⚠️ Ҷарима" onPress={() => setFineOpen(true)} variant="outline" style={{ flex: 1 }} />
        </View>

        {/* Recent Payments */}
        {payments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Пардохтҳои охир</Text>
            {payments.slice(0, 5).map((p) => (
              <Card key={p.id} style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <View>
                    <Text style={styles.paymentType}>{p.paymentType}</Text>
                    <Text style={styles.paymentDate}>{formatDate(p.paidAt)}</Text>
                  </View>
                  <MoneyText amount={p.amount} size={FontSize.md} color={Colors.brand} />
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {/* Pay Sheet */}
      <BottomSheet visible={payOpen} title="Пардохт кун" onClose={() => { setPayOpen(false); setAmount('') }}>
        <View style={styles.sheetForm}>
          <Text style={styles.fieldLabel}>Навъи пардохт</Text>
          <View style={styles.payTypeGrid}>
            {PAY_TYPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.payTypeBtn, payType === key && styles.payTypeBtnActive]}
                onPress={() => setPayType(key)}
              >
                <Text style={[styles.payTypeBtnText, payType === key && { color: Colors.brand }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            label="Маблағ (см)" value={amount} onChangeText={setAmount}
            keyboardType="decimal-pad" placeholder="0"
          />
          <Button
            title={payMut.isPending ? 'Иҷро шудан...' : 'Пардохт кун'}
            onPress={() => { if (amount) payMut.mutate() }}
            loading={payMut.isPending}
            fullWidth
            style={{ marginBottom: Spacing.xxl }}
          />
        </View>
      </BottomSheet>

      {/* Fine Sheet */}
      <BottomSheet visible={fineOpen} title="Ҷарима илова кун" onClose={() => { setFineOpen(false); setFineAmount(''); setFineReason('') }}>
        <View style={styles.sheetForm}>
          <TextInput
            label="Маблағи ҷарима (см)" value={fineAmount} onChangeText={setFineAmount}
            keyboardType="decimal-pad" placeholder="0"
          />
          <TextInput
            label="Сабаби ҷарима" value={fineReason} onChangeText={setFineReason}
            placeholder="Сабабро ворид кунед"
          />
          <Button
            title={fineMut.isPending ? 'Сабт шудан...' : 'Ҷарима илова кун'}
            onPress={() => { if (fineAmount && fineReason) fineMut.mutate() }}
            loading={fineMut.isPending}
            variant="danger"
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
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.brand },
  empName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  empRole: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6 },
  tagsRow: { flexDirection: 'row', gap: 6 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  detailItem: { minWidth: '44%', flex: 1 },
  detailLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  detailVal: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  payrollGrid: { gap: Spacing.sm, marginBottom: Spacing.md },
  payrollItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payrollLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  finalPayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  finalPayLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  actionBtns: { flexDirection: 'row', gap: Spacing.sm },
  paymentCard: { padding: Spacing.md },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentType: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  paymentDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sheetForm: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  payTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  payTypeBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  payTypeBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  payTypeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
})
