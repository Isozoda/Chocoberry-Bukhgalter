import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { useTheme } from '@theme/index'
import { fontSize, radius } from '@theme/index'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple'

interface Props {
  label: string
  variant?: Variant
  style?: ViewStyle
}

export function Badge({ label, variant = 'default', style }: Props) {
  const { colors } = useTheme()

  const variantMap: Record<Variant, { bg: string; text: string }> = {
    success: { bg: colors.greenLight, text: colors.green },
    warning: { bg: colors.amberLight, text: colors.amber },
    danger: { bg: colors.redLight, text: colors.red },
    info: { bg: colors.blueLight, text: colors.blue },
    purple: { bg: colors.purpleLight, text: colors.purple },
    default: { bg: colors.surfaceAlt, text: colors.textSecondary },
  }

  const v = variantMap[variant]

  return (
    <View style={[styles.container, { backgroundColor: v.bg, borderRadius: radius.full }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: fontSize.xs, fontWeight: '600' },
})
