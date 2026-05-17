import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput as RNTextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { employeesApi } from '../../api/employees.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { EmptyState } from '../../components/ui/EmptyState'
import { Badge } from '../../components/ui/Badge'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { StaffStackParamList } from '../../navigation/types'

export function EmployeesScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  })

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', role: 'Кормand', salary: '', phone: '' },
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => employeesApi.create({ name: d.name, role: d.role, salary: d.salary, salaryType: 'MONTHLY', phone: d.phone }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Корманд илова шуд' })
      setAddOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Кормандон"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Attendance')}>
              <Ionicons name="calendar-outline" size={20} color={Colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setAddOpen(true)}>
              <Ionicons name="person-add-outline" size={20} color={Colors.brand} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={employees}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('EmployeeDetail', { id: item.id })}>
            <Card style={styles.employeeCard}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Badge label={item.isActive ? 'Фаъол' : 'Ғайрифаъол'} variant={item.isActive ? 'success' : 'default'} />
                  </View>
                  <Text style={styles.employeeRole}>{item.role}</Text>
                  <View style={styles.salaryRow}>
                    <MoneyText amount={item.salary} size={FontSize.sm} color={Colors.brand} />
                    <Text style={styles.salaryType}> / {item.salaryType === 'MONTHLY' ? 'моҳ' : item.salaryType === 'DAILY' ? 'рӯз' : 'соат'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Корманд нест" />}
      />

      <BottomSheet visible={addOpen} title="Корманд илова кун" onClose={() => { setAddOpen(false); reset() }}>
        <View style={styles.form}>
          <Controller control={control} name="name" rules={{ required: 'Ном лозим аст' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Ном" value={value} onChangeText={onChange}
                placeholder="Исми корманд" error={errors.name?.message} autoCapitalize="words" />
            )}
          />
          <Controller control={control} name="role"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Вазифа" value={value} onChangeText={onChange} placeholder="Баристо, Ошпаз..." />
            )}
          />
          <Controller control={control} name="salary" rules={{ required: 'Маош лозим аст' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Маош (см/моҳ)" value={value} onChangeText={onChange}
                keyboardType="decimal-pad" placeholder="0" error={errors.salary?.message} />
            )}
          />
          <Controller control={control} name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Телефон" value={value} onChangeText={onChange} keyboardType="phone-pad" placeholder="+992..." />
            )}
          />
          <Button
            title={createMutation.isPending ? 'Сабт шудан...' : 'Илова кун'}
            onPress={handleSubmit((d) => createMutation.mutate(d))}
            loading={createMutation.isPending}
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
  iconBtn: { padding: 4 },
  employeeCard: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  employeeName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, marginRight: 8 },
  employeeRole: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  salaryRow: { flexDirection: 'row', alignItems: 'center' },
  salaryType: { fontSize: FontSize.xs, color: Colors.textSecondary },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
})
