import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@theme/index'
import { useTranslation } from 'react-i18next'
import { fontSize, spacing, radius } from '@theme/index'

interface Props {
  onRetry?: () => void
  message?: string
}

export function ErrorView({ onRetry, message }: Props) {
  const { colors } = useTheme()
  const { t } = useTranslation()
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.red} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {message ?? t('errors.loadFailed')}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.btn, { backgroundColor: colors.brand, borderRadius: radius.md }]}
        >
          <Text style={[styles.btnText, { color: '#fff' }]}>{t('actions.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8] },
  text: { fontSize: fontSize.base, marginTop: spacing[3], textAlign: 'center' },
  btn: { marginTop: spacing[4], paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  btnText: { fontSize: fontSize.base, fontWeight: '600' },
})
