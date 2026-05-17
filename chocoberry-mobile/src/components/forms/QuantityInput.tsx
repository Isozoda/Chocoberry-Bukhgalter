import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight, radius } from '@theme/index'

interface Props {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}

export function QuantityInput({ value, onChange, min = 0, max = 9999, step = 1 }: Props) {
  const { colors } = useTheme()
  return (
    <View style={[styles.container, { borderColor: colors.border, borderRadius: radius.md }]}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - step))}
        style={[styles.btn, { backgroundColor: colors.surfaceAlt }]}
      >
        <Text style={[styles.sign, { color: colors.textPrimary }]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + step))}
        style={[styles.btn, { backgroundColor: colors.surfaceAlt }]}
      >
        <Text style={[styles.sign, { color: colors.textPrimary }]}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, overflow: 'hidden' },
  btn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sign: { fontSize: 20, fontWeight: fontWeight.bold },
  value: { paddingHorizontal: 16, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
})
