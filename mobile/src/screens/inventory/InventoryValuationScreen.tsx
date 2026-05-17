import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../../api/inventory.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { MoneyText } from '../../components/ui/MoneyText'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'

export function InventoryValuationScreen() {
  const insets = useSafeAreaInsets()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory', 'valuation'],
    queryFn: inventoryApi.valuation,
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Арзишгузории захира" showBack />

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
        ListHeaderComponent={
          <Card style={styles.totalCard}>
            <Text style={styles.totalLabel}>Арзиши умумии захира</Text>
            <MoneyText amount={data?.totalValue ?? '0'} size={FontSize.xxxl} color={Colors.brand} />
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <MoneyText amount={item.value} size={FontSize.md} color={Colors.text} />
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.detail}>{item.stock} × {item.avgCost} см</Text>
            </View>
          </Card>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.sm },
  totalCard: { alignItems: 'center', paddingVertical: Spacing.xxl, marginBottom: Spacing.sm },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  itemCard: { padding: Spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1 },
  itemDetails: { marginTop: 4 },
  detail: { fontSize: FontSize.xs, color: Colors.textSecondary },
})
