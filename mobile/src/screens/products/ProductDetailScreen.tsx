import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useRoute, type RouteProp } from '@react-navigation/native'
import { productsApi } from '../../api/products.api'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { MoneyText } from '../../components/ui/MoneyText'
import { Badge } from '../../components/ui/Badge'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'
import type { MoreStackParamList } from '../../navigation/types'

type Route = RouteProp<MoreStackParamList, 'ProductDetail'>

export function ProductDetailScreen() {
  const insets = useSafeAreaInsets()
  const { params } = useRoute<Route>()

  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ['products', params.id],
    queryFn: () => productsApi.getById(params.id),
  })

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={product?.name ?? 'Маҳсулот'} showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.brand} />}
      >
        {product && (
          <>
            <Card>
              <View style={styles.header}>
                <View style={styles.emoji}><Text style={{ fontSize: 40 }}>☕</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{product.name}</Text>
                  {product.nameTg && <Text style={styles.sub}>{product.nameTg}</Text>}
                  <View style={styles.badges}>
                    <Badge label={product.isActive ? 'Фаъол' : 'Ғайрифаъол'} variant={product.isActive ? 'success' : 'default'} />
                    {product.category && <Badge label={product.category} variant="info" />}
                  </View>
                </View>
              </View>
              <View style={styles.priceGrid}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Нарх</Text>
                  <MoneyText amount={product.price} size={FontSize.xl} color={Colors.brand} />
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Арзиш</Text>
                  <MoneyText amount={product.cost} size={FontSize.xl} color={Colors.text} />
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Фоида</Text>
                  <MoneyText amount={String(Number(product.price) - Number(product.cost))} size={FontSize.xl} color={Colors.success} />
                </View>
              </View>
            </Card>

            {product.recipe && product.recipe.length > 0 && (
              <Card>
                <Text style={styles.sectionTitle}>📋 Дастур (Recipe)</Text>
                {product.recipe.map((r) => (
                  <View key={r.id} style={styles.recipeRow}>
                    <Text style={styles.recipeName}>{r.inventoryItem?.name ?? '—'}</Text>
                    <Text style={styles.recipeQty}>{r.quantity} {r.unit.toLowerCase()}</Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  emoji: { width: 60, height: 60, borderRadius: 16, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  priceGrid: { flexDirection: 'row', gap: Spacing.md },
  priceItem: { flex: 1, alignItems: 'center' },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  recipeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  recipeName: { fontSize: FontSize.sm, color: Colors.text },
  recipeQty: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand },
})
