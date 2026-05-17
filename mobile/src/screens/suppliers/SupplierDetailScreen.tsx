import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRoute, type RouteProp } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { suppliersApi } from '../../api/suppliers.api'
import { inventoryApi } from '../../api/inventory.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/date.util'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Route = RouteProp<MoreStackParamList, 'SupplierDetail'>

export function SupplierDetailScreen() {
  const insets = useSafeAreaInsets()
  const { params } = useRoute<Route>()
  const queryClient = useQueryClient()
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [selInventoryId, setSelInventoryId] = useState('')

  const { data: supplier, isLoading, refetch } = useQuery({
    queryKey: ['suppliers', params.id],
    queryFn: () => suppliersApi.getById(params.id),
  })

  const { data: purchases } = useQuery({
    queryKey: ['suppliers', params.id, 'purchases'],
    queryFn: () => suppliersApi.getPurchases(params.id, { limit: 20 }),
  })

  const { data: inventory } = useQuery({
    queryKey: ['inventory', 'list', { limit: 100 }],
    queryFn: () => inventoryApi.list({ limit: 100 }),
  })

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { inventoryItemId: '', quantity: '', pricePerUnit: '', notes: '' },
  })

  const purchaseMut = useMutation({
    mutationFn: (d: any) => suppliersApi.purchase(params.id, {
      inventoryItemId: d.inventoryItemId, unit: 'KG',
      quantity: d.quantity, pricePerUnit: d.pricePerUnit, notes: d.notes,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Харидорӣ сабт шуд' })
      setPurchaseOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['suppliers', params.id, 'purchases'] })
    },
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={supplier?.name ?? 'Таъминкунанда'} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        {supplier && (
          <Card>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Навъ</Text>
                <Badge label={supplier.type} variant="info" />
              </View>
              {supplier.phone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Телефон</Text>
                  <Text style={styles.infoVal}>{supplier.phone}</Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ҳолат</Text>
                <Badge label={supplier.isActive ? 'Фаъол' : 'Ғайрифаъол'} variant={supplier.isActive ? 'success' : 'default'} />
              </View>
            </View>
          </Card>
        )}

        <Button title="+ Харидорӣ сабт кун" onPress={() => setPurchaseOpen(true)} fullWidth />

        <Text style={styles.sectionTitle}>Харидориҳои охир</Text>
        {(purchases?.data ?? []).map((p) => (
          <Card key={p.id} style={styles.purchaseCard}>
            <View style={styles.purchaseRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.purchaseName}>{p.inventoryItem?.name ?? '—'}</Text>
                <Text style={styles.purchaseDate}>{formatDate(p.createdAt)}</Text>
                <Text style={styles.purchaseQty}>{p.quantity} × <MoneyText amount={p.pricePerUnit} size={FontSize.sm} /></Text>
              </View>
              <MoneyText amount={p.totalAmount} size={FontSize.md} color={Colors.brand} />
            </View>
          </Card>
        ))}
      </ScrollView>

      <BottomSheet visible={purchaseOpen} title="Харидорӣ сабт кун" onClose={() => { setPurchaseOpen(false); reset() }}>
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Ашё</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {(inventory?.data ?? []).slice(0, 20).map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={[styles.invBtn, selInventoryId === inv.id && styles.invBtnActive]}
                  onPress={() => setSelInventoryId(inv.id)}
                >
                  <Text style={[styles.invBtnText, selInventoryId === inv.id && { color: Colors.brand }]}>{inv.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Controller control={control} name="quantity"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Миқдор" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0.00" />
            )}
          />
          <Controller control={control} name="pricePerUnit"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Нарх/воҳид (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0.00" />
            )}
          />
          <Controller control={control} name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Эзоҳ" value={value} onChangeText={onChange} placeholder="Ихтиёрӣ" />
            )}
          />
          <Button
            title={purchaseMut.isPending ? 'Сабт шудан...' : 'Сабт кун'}
            onPress={handleSubmit((d) => purchaseMut.mutate({ ...d, inventoryItemId: selInventoryId }))}
            loading={purchaseMut.isPending}
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
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  infoItem: { minWidth: '44%' },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  infoVal: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  purchaseCard: { padding: Spacing.md },
  purchaseRow: { flexDirection: 'row', alignItems: 'flex-start' },
  purchaseName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  purchaseDate: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  purchaseQty: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  invBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.backgroundSecondary },
  invBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  invBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
})
