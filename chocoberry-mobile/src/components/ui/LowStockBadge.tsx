import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@theme/index'
import { useTranslation } from 'react-i18next'
import { fontSize, fontWeight, radius } from '@theme/index'

export function LowStockBadge() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  return (
    <View style={[styles.container, { backgroundColor: colors.redLight, borderRadius: radius.sm }]}>
      <Text style={[styles.text, { color: colors.red }]}>⚠ {t('inventory.lowStock')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
})
