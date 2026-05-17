import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../../src/theme'
import { inventoryApi } from '../../../src/api/inventory.api'
import { ScreenWrapper } from '../../../src/components/layout/ScreenWrapper'
import { Header } from '../../../src/components/layout/Header'
import { LoadingSkeleton } from '../../../src/components/ui/LoadingSkeleton'
import { MoneyInput } from '../../../src/components/forms/MoneyInput'
import { FormInput } from '../../../src/components/forms/FormInput'
import { fontSize, fontWeight, spacing, radius } from '../../../src/theme'

export default function WasteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const qc = useQueryClient()

  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => inventoryApi.getById(id!),
    enabled: !!id,
  })

  const wasteMutation = useMutation({
    mutationFn: (dto: { quantity: string; reason: string }) => inventoryApi.waste(id!, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['inventory-item', id] })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({ type: 'success', text1: t('toast.saved') })
      router.back()
    },
  })

  if (isLoading || !item) return <LoadingSkeleton />

  return (
    <ScreenWrapper>
      <Header title={`${t('inventory.waste')}: ${item.name}`} />

      <ScrollView style={{ padding: spacing[4] }}>
        <MoneyInput
          label={`${t('labels.quantity')} (${item.unit})`}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="0.00"
          suffix={item.unit}
        />

        <FormInput
          label={t('labels.description')}
          value={reason}
          onChangeText={setReason}
          placeholder={t('labels.notes')}
          multiline
        />

        <View style={styles.stockInfo}>
          <Text style={{ color: colors.textSecondary }}>{t('inventory.currentStock')}: {item.currentStock} {item.unit}</Text>
        </View>

        <TouchableOpacity
          onPress={() => wasteMutation.mutate({ quantity, reason })}
          disabled={!quantity || wasteMutation.isPending}
          style={[styles.btn, { backgroundColor: colors.red, borderRadius: radius.lg, opacity: !quantity ? 0.5 : 1 }]}
        >
          <Text style={styles.btnText}>{wasteMutation.isPending ? '...' : t('inventory.waste')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  stockInfo: { marginVertical: spacing[4], alignItems: 'center' },
  btn: { padding: spacing[4], alignItems: 'center', marginTop: spacing[4] },
  btnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
})
