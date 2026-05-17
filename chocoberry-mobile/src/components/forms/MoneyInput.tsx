import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight, spacing, radius } from '@theme/index'

interface Props extends Omit<TextInputProps, 'keyboardType'> {
  label?: string
  error?: string
  suffix?: string
}

export function MoneyInput({ label, error, suffix = 'см', style, ...props }: Props) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  const borderColor = error ? colors.red : focused ? colors.brand : colors.border

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[styles.row, { borderColor, borderRadius: radius.md, backgroundColor: colors.surface }]}>
        <TextInput
          {...props}
          keyboardType="decimal-pad"
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.suffix, { color: colors.textSecondary }]}>{suffix}</Text>
      </View>
      {error && <Text style={[styles.error, { color: colors.red }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: fontSize.base, padding: 0, fontVariant: ['tabular-nums'] },
  suffix: { fontSize: fontSize.base, marginLeft: spacing[2] },
  error: { fontSize: fontSize.xs },
})
