import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { businessApi } from '../../api/business.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { BusinessType } from '../../types/business.types'

const BUSINESS_TYPES: { key: BusinessType; label: string; icon: string }[] = [
  { key: 'FOOD', label: 'Хӯрокворӣ', icon: '🍽️' },
  { key: 'RETAIL', label: 'Чакана', icon: '🛒' },
  { key: 'SERVICE', label: 'Хидматрасонӣ', icon: '🔧' },
  { key: 'OTHER', label: 'Дигар', icon: '💼' },
]

export function BusinessProfileScreen() {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [selType, setSelType] = useState<BusinessType>('FOOD')

  const { data: business, isLoading, refetch } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.get,
  })

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { name: '', address: '', phone: '', bonusPercent: '' },
  })

  const openEdit = () => {
    if (business) {
      setSelType(business.type)
      reset({
        name: business.name,
        address: business.address ?? '',
        phone: business.phone ?? '',
        bonusPercent: business.bonusPercent ?? '',
      })
    }
    setEditOpen(true)
  }

  const updateMut = useMutation({
    mutationFn: (d: any) => businessApi.update({
      name: d.name,
      type: selType,
      address: d.address || undefined,
      phone: d.phone || undefined,
      bonusPercent: d.bonusPercent || undefined,
    }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Профил навсозӣ шуд' })
      setEditOpen(false)
      queryClient.invalidateQueries({ queryKey: ['business'] })
    },
  })

  const getTypeInfo = (type: BusinessType) => BUSINESS_TYPES.find((t) => t.key === type) ?? BUSINESS_TYPES[3]

  if (!business && !isLoading) return null

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Профили тиҷорат"
        showBack
        right={
          <TouchableOpacity onPress={openEdit} style={{ padding: 4 }}>
            <Ionicons name="create-outline" size={22} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        {business && (
          <>
            {/* Business Header */}
            <Card style={styles.headerCard}>
              <View style={styles.bizIcon}>
                <Text style={styles.bizIconText}>{getTypeInfo(business.type).icon}</Text>
              </View>
              <Text style={styles.bizName}>{business.name}</Text>
              <Text style={styles.bizType}>{getTypeInfo(business.type).label}</Text>
            </Card>

            {/* Details */}
            <Card>
              <Text style={styles.sectionTitle}>Маълумот</Text>

              {[
                { icon: 'location-outline', label: 'Суроға', value: business.address || '—' },
                { icon: 'call-outline', label: 'Телефон', value: business.phone || '—' },
                { icon: 'cash-outline', label: 'Асъори', value: business.currency ?? 'TJS' },
                { icon: 'star-outline', label: 'Фоизи бонус', value: `${business.bonusPercent ?? 0}%` },
              ].map(({ icon, label, value }) => (
                <View key={label} style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name={icon as any} size={18} color={Colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                </View>
              ))}
            </Card>

            {/* Cashbox Summary */}
            {business.cashbox && (
              <Card>
                <Text style={styles.sectionTitle}>💰 Тавоноии касса</Text>
                <View style={styles.cashboxGrid}>
                  <View style={styles.cashboxItem}>
                    <Text style={styles.cashboxLabel}>Нақд</Text>
                    <Text style={[styles.cashboxValue, { color: Colors.success }]}>
                      {business.cashbox.balance} см
                    </Text>
                  </View>
                  <View style={[styles.cashboxItem, styles.cashboxDivider]}>
                    <Text style={styles.cashboxLabel}>Корт</Text>
                    <Text style={[styles.cashboxValue, { color: Colors.info }]}>
                      {business.cashbox.cardBalance} см
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Meta */}
            <Card>
              <Text style={styles.sectionTitle}>Маълумоти система</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ҳолат</Text>
                <View style={[styles.statusBadge, { backgroundColor: business.isActive ? Colors.successLight : Colors.errorLight }]}>
                  <Text style={[styles.statusText, { color: business.isActive ? Colors.success : Colors.error }]}>
                    {business.isActive ? 'Фаъол' : 'Ғайрифаъол'}
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Сохта шуд</Text>
                <Text style={styles.metaValue}>{business.createdAt.slice(0, 10)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ID</Text>
                <Text style={styles.metaValue}>{business.id.slice(0, 8)}…</Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Edit Sheet */}
      <BottomSheet visible={editOpen} title="Профилро таҳрир кун" onClose={() => setEditOpen(false)}>
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Навъи тиҷорат</Text>
          <View style={styles.typeGrid}>
            {BUSINESS_TYPES.map(({ key, label, icon }) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeBtn, selType === key && styles.typeBtnActive]}
                onPress={() => setSelType(key)}
              >
                <Text>{icon}</Text>
                <Text style={[styles.typeBtnText, selType === key && { color: Colors.brand }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Controller control={control} name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Номи тиҷорат" value={value} onChangeText={onChange} placeholder="Choco Berry" />
            )}
          />
          <Controller control={control} name="address"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Суроға" value={value} onChangeText={onChange} placeholder="Шаҳр, кӯча" />
            )}
          />
          <Controller control={control} name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Телефон" value={value} onChangeText={onChange} keyboardType="phone-pad" placeholder="+992..." />
            )}
          />
          <Controller control={control} name="bonusPercent"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Фоизи бонус (%)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" />
            )}
          />

          <Button
            title={updateMut.isPending ? 'Сабт шудан...' : 'Сабт кун'}
            onPress={handleSubmit((d) => updateMut.mutate(d))}
            loading={updateMut.isPending}
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
  headerCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  bizIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.brandFaded, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  bizIconText: { fontSize: 36 },
  bizName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  bizType: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  infoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginTop: 2 },
  cashboxGrid: { flexDirection: 'row' },
  cashboxItem: { flex: 1, alignItems: 'center' },
  cashboxDivider: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  cashboxLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cashboxValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  metaLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaValue: { fontSize: FontSize.sm, color: Colors.text },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  typeBtnActive: { borderColor: Colors.brand, backgroundColor: Colors.brandFaded },
  typeBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
})
