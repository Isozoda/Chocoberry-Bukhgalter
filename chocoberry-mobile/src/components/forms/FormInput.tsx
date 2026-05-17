import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight, spacing, radius } from '@theme/index'

interface Props extends TextInputProps {
  label?: string
  error?: string
  secureToggle?: boolean
}

export function FormInput({ label, error, secureToggle, style, ...props }: Props) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  const [secure, setSecure] = useState(!!props.secureTextEntry)

  const borderColor = error ? colors.red : focused ? colors.brand : colors.border

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View style={[styles.inputRow, { borderColor, borderRadius: radius.md, backgroundColor: colors.surface }]}>
        <TextInput
          {...props}
          secureTextEntry={secure}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.textTertiary}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeBtn}>
            <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.red }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: fontSize.base, padding: 0 },
  eyeBtn: { padding: 4 },
  error: { fontSize: fontSize.xs },
})
