import { useState } from 'react'
import { View, Text, TextInput as RNTextInput, StyleSheet, TouchableOpacity, type TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'

interface Props extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isPassword?: boolean
}

export function TextInput({ label, error, leftIcon, rightIcon, isPassword = false, ...props }: Props) {
  const [showPw, setShowPw] = useState(false)

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error ? styles.inputError : styles.inputNormal]}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <RNTextInput
          {...props}
          secureTextEntry={isPassword && !showPw}
          style={[styles.input, leftIcon && styles.inputWithLeft, (rightIcon || isPassword) && styles.inputWithRight]}
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize={props.autoCapitalize ?? 'none'}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.icon}>
            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.icon}>{rightIcon}</View>
        ) : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSecondary,
    minHeight: 46,
  },
  inputNormal: { borderColor: Colors.border },
  inputError: { borderColor: Colors.error },
  icon: { paddingHorizontal: Spacing.sm },
  input: {
    flex: 1, fontSize: FontSize.md, color: Colors.text,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  inputWithLeft: { paddingLeft: 0 },
  inputWithRight: { paddingRight: 0 },
  errorText: { fontSize: FontSize.xs, color: Colors.error },
})
