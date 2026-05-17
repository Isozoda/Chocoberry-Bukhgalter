import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import Decimal from 'decimal.js'
import { useTheme } from '../../../src/theme'
import { productsApi } from '../../../src/api/products.api'
import { inventoryApi } from '../../../src/api/inventory.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Badge } from '../../../src/components/ui/Badge'
import { MoneyText } from '../../../src/components/ui/MoneyText'
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { QuantityInput } from '../../../src/components/forms/QuantityInput'
import { formatMoney, addMoney, multiplyMoney } from '../../../src/utils/decimal.util'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'
import type { Product } from '../../../src/types/product.types'

export default function ProductsScreen() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [ingredients, setIngredients] = useState<{ inventoryItemId: string; quantity: string; unit: string }[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  })

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-all'],
    queryFn: () => inventoryApi.list({ limit: 200 }),
  })

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, ings }: { id: string; ings: any[] }) => productsApi.updateRecipe(id, ings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      setRecipeProduct(null)
      Toast.show({ type: 'success', text1: t('toast.saved') })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      setDeleteProduct(null)
      Toast.show({ type: 'success', text1: t('toast.deleted') })
    },
  })

  const products = data?.items ?? []
  const inventoryItems = inventoryData?.items ?? []

  const openRecipe = (product: Product) => {
    setRecipeProduct(product)
    setIngredients(product.recipe.map((r) => ({ inventoryItemId: r.inventoryItemId, quantity: r.quantity, unit: r.unit })))
  }

  const recipeCost = addMoney(
    ...ingredients.map((ing) => {
      const item = inventoryItems.find((i) => i.id === ing.inventoryItemId)
      return item ? multiplyMoney(item.avgCost, ing.quantity || '0').toString() : '0'
    }).concat(['0'])
  )

  if (isLoading) return <LoadingSkeleton />

  return (
    <ScreenWrapper scroll={false}>
      <Header title={t('nav.products')} showBack={false} />

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: spacing[3] }}
        renderItem={({ item: product }) => {
          const margin = new Decimal(product.price).minus(new Decimal(product.costPrice))
          const marginPct = new Decimal(product.price).greaterThan(0)
            ? margin.dividedBy(product.price).times(100)
            : new Decimal(0)
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>{product.name}</Text>
                <Badge label={product.type} variant="info" />
              </View>
              <MoneyText amount={product.price} bold size={fontSize.lg} color={colors.brand} />
              <Text style={[styles.costText, { color: colors.textSecondary }]}>{t('labels.cost')}: {formatMoney(product.costPrice)}</Text>
              <Text style={[styles.marginText, { color: colors.green }]}>{t('labels.margin')}: {marginPct.toFixed(1)}%</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openRecipe(product)} style={[styles.actionBtn, { backgroundColor: colors.blueLight }]}>
                  <Text style={{ color: colors.blue, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>{t('products.recipe')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeleteProduct(product)} style={[styles.actionBtn, { backgroundColor: colors.redLight }]}>
                  <Text style={{ color: colors.red, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>{t('actions.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
        ListEmptyComponent={<EmptyState message={t('empty.noProducts')} />}
      />

      {/* Recipe Modal */}
      <Modal visible={!!recipeProduct} animationType="slide" onRequestClose={() => setRecipeProduct(null)}>
        <ScreenWrapper>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('products.recipe')} — {recipeProduct?.name}
            </Text>
            <TouchableOpacity onPress={() => setRecipeProduct(null)}>
              <Text style={{ color: colors.brand, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: spacing[4] }}>
            {ingredients.map((ing, idx) => {
              const invItem = inventoryItems.find((i) => i.id === ing.inventoryItemId)
              return (
                <View key={idx} style={styles.ingRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: '40%' }}>
                    {inventoryItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => { const n = [...ingredients]; n[idx].inventoryItemId = item.id; setIngredients(n) }}
                        style={[styles.invChip, { backgroundColor: ing.inventoryItemId === item.id ? colors.brand : colors.surfaceAlt }]}
                      >
                        <Text style={{ color: ing.inventoryItemId === item.id ? '#fff' : colors.textSecondary, fontSize: fontSize.xs }}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <MoneyInput value={ing.quantity} onChangeText={(v) => { const n = [...ingredients]; n[idx].quantity = v; setIngredients(n) }} placeholder="0" suffix="кг" style={{ flex: 1 }} />
                  <TouchableOpacity onPress={() => setIngredients(ingredients.filter((_, i) => i !== idx))}>
                    <Text style={{ color: colors.red, fontSize: 20 }}>×</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
            <TouchableOpacity onPress={() => setIngredients([...ingredients, { inventoryItemId: '', quantity: '0', unit: 'KG' }])} style={[styles.addBtn, { borderColor: colors.border }]}>
              <Text style={{ color: colors.brand }}>+ {t('products.addIngredient')}</Text>
            </TouchableOpacity>

            <View style={[styles.costSummary, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ color: colors.textSecondary }}>{t('products.totalCost')}</Text>
              <MoneyText amount={recipeCost} bold color={colors.brand} />
            </View>

            <TouchableOpacity
              onPress={() => recipeProduct && updateRecipeMutation.mutate({ id: recipeProduct.id, ings: ingredients })}
              disabled={updateRecipeMutation.isPending}
              style={[styles.saveBtn, { backgroundColor: colors.brand, borderRadius: radius.lg }]}
            >
              <Text style={{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
                {updateRecipeMutation.isPending ? '...' : t('actions.save')}
              </Text>
            </TouchableOpacity>
            <View style={{ height: spacing[8] }} />
          </ScrollView>
        </ScreenWrapper>
      </Modal>

      <ConfirmModal
        visible={!!deleteProduct}
        title={t('confirm.delete')}
        onConfirm={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
        onCancel={() => setDeleteProduct(null)}
        danger
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  grid: { padding: spacing[4], gap: spacing[3] },
  card: { flex: 1, borderRadius: radius.lg, borderWidth: 1, padding: spacing[4], gap: spacing[2] },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, flex: 1 },
  costText: { fontSize: fontSize.xs },
  marginText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  cardActions: { flexDirection: 'row', gap: spacing[2] },
  actionBtn: { flex: 1, padding: spacing[2], borderRadius: radius.sm, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderBottomWidth: 1 },
  modalTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, flex: 1 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] },
  invChip: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.sm, marginRight: spacing[1] },
  addBtn: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing[3], alignItems: 'center', marginBottom: spacing[4] },
  costSummary: { borderRadius: radius.md, padding: spacing[4], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
  saveBtn: { padding: spacing[4], alignItems: 'center' },
})
