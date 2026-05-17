import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput as RNTextInput, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { inventoryApi } from '../../api/inventory.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { MoneyText } from '../../components/ui/MoneyText'
import { EmptyState } from '../../components/ui/EmptyState'
import { toDecimal } from '../../utils/decimal.util'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'
import type { InventoryStackParamList } from '../../navigation/types'
import type { InventoryItem } from '../../types/inventory.types'

function getStockBadge(item: InventoryItem): { label: string; variant: 'success' | 'error' | 'warning' } {
  const stock = toDecimal(item.currentStock)
  const min = toDecimal(item.minStockLevel)
  if (stock.lte(0)) return { label: 'Тамом', variant: 'error' }
  if (stock.lte(min)) return { label: 'Кам', variant: 'error' }
  if (stock.lte(min.times(2))) return { label: 'Эҳтиёт', variant: 'warning' }
  return { label: 'Кофӣ', variant: 'success' }
}

export function InventoryScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<InventoryStackParamList>>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory', 'list', { page, search }],
    queryFn: () => inventoryApi.list({ page, limit: 50, search: search || undefined }),
  })

  const items = data?.data ?? []

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Захира"
        right={
          <TouchableOpacity
            style={styles.valuationBtn}
            onPress={() => navigation.navigate('InventoryValuation')}
          >
            <Ionicons name="analytics-outline" size={20} color={Colors.brand} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Ашёро ҷустуҷӯ кунед..."
          placeholderTextColor={Colors.textTertiary}
          value={search} onChangeText={(v) => { setSearch(v); setPage(1) }}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        renderItem={({ item }) => {
          const badge = getStockBadge(item)
          return (
            <TouchableOpacity onPress={() => navigation.navigate('InventoryDetail', { id: item.id })}>
              <Card style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Badge label={badge.label} variant={badge.variant} />
                    </View>
                    <Text style={styles.itemCategory}>{item.category ?? 'Бесинф'}</Text>
                    <View style={styles.itemStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Захира</Text>
                        <Text style={[styles.statValue, { color: badge.variant === 'error' ? Colors.error : Colors.text }]}>
                          {item.currentStock} {item.unit.toLowerCase()}
                        </Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Ҳадди ақал</Text>
                        <Text style={styles.statValue}>{item.minStockLevel} {item.unit.toLowerCase()}</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Арзиш</Text>
                        <MoneyText amount={item.avgCost} size={FontSize.sm} />
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </View>
              </Card>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Ашё нест" />}
      />
    </View>
  )
}

function getCategoryColor(category?: string | null): string {
  const map: Record<string, string> = {
    FRUIT: '#10B981', CHOCOLATE: '#8B5CF6', PACKAGING: '#F59E0B', OTHER: '#6B7280',
  }
  return map[category ?? 'OTHER'] ?? '#6B7280'
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  valuationBtn: { padding: 4 },
  list: { padding: Spacing.md, gap: Spacing.sm },
  itemCard: {},
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  categoryDot: { width: 4, borderRadius: 2, alignSelf: 'stretch', marginRight: 4 },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, marginRight: 8 },
  itemCategory: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  itemStats: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: Colors.textTertiary },
  statValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginTop: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: Colors.border, marginHorizontal: 4 },
})
