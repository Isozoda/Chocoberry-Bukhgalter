import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@theme/index'
import { fontSize, spacing, radius } from '@theme/index'
import { TouchableOpacity } from 'react-native'

interface Props {
  message: string
  icon?: keyof typeof Ionicons.glyphMap
  onRetry?: () => void
  retryLabel?: string
}

export function EmptyState({ message, icon = 'archive-outline', onRetry, retryLabel }: Props) {
  const { colors } = useTheme()
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textTertiary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          onPress={onRetry} 
          style={[styles.retryBtn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}
        >
          <Text style={{ color: colors.brand, fontWeight: '600' }}>{retryLabel || 'Try Again'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8] },
  text: { fontSize: fontSize.base, marginTop: spacing[3], textAlign: 'center' },
  retryBtn: { marginTop: spacing[4], paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
})
