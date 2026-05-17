import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { suppliersApi } from '../../api/suppliers.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'
import type { SupplierType } from '../../types/supplier.types'

type Nav = NativeStackNavigationProp<MoreStackParamList>

const SUP_TYPES: SupplierType[] = ['FRUIT', 'CHOCOLATE', 'PACKAGING', 'OTHER']
const typeLabel = (t: SupplierType) => ({ FRUIT: 'Меваҷот', CHOCOLATE: 'Шоколад', PACKAGING: 'Бастабандӣ', OTHER: 'Дигар' }[t])

export function SuppliersScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [selType, setSelType] = useState<SupplierType>('FRUIT')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.list({ limit: 50 }),
  })

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', phone: '' },
  })

  const createMut = useMutation({
    mutationFn: (d: any) => suppliersApi.create({ name: d.name, type: selType, phone: d.phone }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Таъминкунанда илова шуд' })
      setAddOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Таъминкунандагон" showBack
        right={
          <TouchableOpacity onPress={() => setAddOpen(true)} style={{ padding: 4 }}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('SupplierDetail', { id: item.id })}>
            <Card style={styles.supplierCard}>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Text style={{ fontSize: 22 }}>
                    {item.type === 'FRUIT' ? '🍓' : item.type === 'CHOCOLATE' ? '🍫' : item.type === 'PACKAGING' ? '📦' : '🏪'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.supplierName}>{item.name}</Text>
                  <View style={styles.tagRow}>
                    <Badge label={typeLabel(item.type)} variant="info" />
                    <Badge label={item.isActive ? 'Фаъол' : 'Ғайрифаъол'} variant={item.isActive ? 'success' : 'default'} />
                  </View>
                  {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="people-circle-outline" title="Таъминкунанда нест" />}
      />

      <BottomSheet visible={addOpen} title="Таъминкунанда илова кун" onClose={() => { setAddOpen(false); reset() }}>
        <View style={styles.form}>
          <Controller control={control} name="name" rules={{ required: 'Ном лозим аст' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Ном" value={value} onChangeText={onChange} placeholder="Номи таъминкунанда" error={errors.name?.message} autoCapitalize="words" />
            )}
          />
          <Text style={styles.fieldLabel}>Навъ</Text>
          <View style={styles.typeGrid}>
            {SUP_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, selType === t && styles.typeBtnActive]}
                onPress={() => setSelType(t)}
              >
                <Text style={[styles.typeBtnText, selType === t && { color: Colors.brand }]}>{typeLabel(t)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Controller control={control} name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Телефон" value={value} onChangeText={onChange} keyboardType="phone-pad" placeholder="+992..." />
            )}
          />
          <Button
            title={createMut.isPending ? 'Сабт шудан...' : 'Илова кун'}
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
  supplierCard: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  supplierName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 4 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  phone: { fontSize: FontSize.xs, color: Colors.textSecondary },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  typeBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.backgroundSecondary },
  typeBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  typeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
})
