import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useTheme } from '@theme/index'
import { useTranslation } from 'react-i18next'
import { fontSize, fontWeight, spacing, radius } from '@theme/index'

interface Props {
  visible: boolean
  title: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export function ConfirmModal({ visible, title, message, onConfirm, onCancel, confirmLabel, cancelLabel, danger }: Props) {
  const { colors } = useTheme()
  const { t } = useTranslation()

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.btn, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}
            >
              <Text style={[styles.btnText, { color: colors.textPrimary }]}>
                {cancelLabel ?? t('confirm.no')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.btn, { backgroundColor: danger ? colors.red : colors.brand, borderRadius: radius.md }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>
                {confirmLabel ?? t('confirm.yes')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '85%', padding: spacing[6], borderRadius: radius.xl, gap: spacing[4] },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center' },
  message: { fontSize: fontSize.base, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: spacing[3] },
  btn: { flex: 1, padding: spacing[4], alignItems: 'center' },
  btnText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
})
