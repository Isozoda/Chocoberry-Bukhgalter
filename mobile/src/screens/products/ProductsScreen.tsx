import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput as RNTextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { productsApi } from '../../api/products.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Nav = NativeStackNavigationProp<MoreStackParamList>

export function ProductsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Nav>()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', 'list', { limit: 100 }],
    queryFn: () => productsApi.list({ limit: 100 }),
  })

  const filtered = (data?.data ?? []).filter(
    (p) => search === '' || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', price: '', category: '' },
  })

  const createMut = useMutation({
    mutationFn: (d: any) => productsApi.create({ name: d.name, price: d.price, category: d.category, unit: 'pc' }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Маҳсулот илова шуд' })
      setAddOpen(false); reset()
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Маҳсулот" showBack
        right={
          <TouchableOpacity onPress={() => setAddOpen(true)} style={{ padding: 4 }}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
        <RNTextInput
          style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Маҳсулотро ҷустуҷӯ кунед..." placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.id })}>
            <Card style={styles.productCard}>
              <View style={styles.productRow}>
                <View style={styles.emoji}>
                  <Text style={{ fontSize: 24 }}>☕</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Badge label={item.isActive ? 'Фаъол' : 'Ғайрифаъол'} variant={item.isActive ? 'success' : 'default'} />
                  </View>
                  {item.category && <Text style={styles.category}>{item.category}</Text>}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Нарх: </Text>
                    <MoneyText amount={item.price} size={FontSize.sm} color={Colors.brand} />
                    <Text style={styles.priceLabel}> • Арзиш: </Text>
                    <MoneyText amount={item.cost} size={FontSize.sm} color={Colors.textSecondary} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="cafe-outline" title="Маҳсулот нест" />}
      />

      <BottomSheet visible={addOpen} title="Маҳсулот илова кун" onClose={() => { setAddOpen(false); reset() }}>
        <View style={styles.form}>
          <Controller control={control} name="name" rules={{ required: 'Ном лозим аст' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Ном" value={value} onChangeText={onChange} placeholder="Номи маҳсулот" error={errors.name?.message} autoCapitalize="words" />
            )}
          />
          <Controller control={control} name="price" rules={{ required: 'Нарх лозим аст' }}
            render={({ field: { onChange, value } }) => (
              <TextInput label="Нарх (см)" value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" error={errors.price?.message} />
            )}
          />
          <Controller control={control} name="category"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Навъ" value={value} onChangeText={onChange} placeholder="Нӯшокӣ, Хӯрок..." />
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  list: { padding: Spacing.md, gap: Spacing.sm },
  productCard: {},
  productRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emoji: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  productName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, marginRight: 8 },
  category: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  form: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: 8 },
})
