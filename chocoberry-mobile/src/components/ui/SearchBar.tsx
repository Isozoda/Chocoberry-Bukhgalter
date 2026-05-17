import React from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@theme/index'
import { useTranslation } from 'react-i18next'
import { fontSize, spacing, radius } from '@theme/index'

interface Props {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder }: Props) {
  const { colors } = useTheme()
  const { t } = useTranslation()
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg }]}>
      <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('actions.search')}
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, { color: colors.textPrimary }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: 10, gap: spacing[2] },
  input: { flex: 1, fontSize: fontSize.base, padding: 0 },
})
