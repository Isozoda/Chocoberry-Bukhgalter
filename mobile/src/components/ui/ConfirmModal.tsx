import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'

interface Props {
  visible: boolean
  title: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export function ConfirmModal({
  visible, title, message, onConfirm, onCancel,
  confirmText = 'Тасдиқ', cancelText = 'Бекор кун', danger = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.cancel]}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.btn, danger ? styles.danger : styles.confirm]}>
              <Text style={[styles.confirmText, danger && { color: '#fff' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl,
  },
  box: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xxl, width: '100%', maxWidth: 340,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  message: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  cancel: { backgroundColor: Colors.surfaceSecondary },
  confirm: { backgroundColor: Colors.brandFaded },
  danger: { backgroundColor: Colors.error },
  cancelText: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  confirmText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.brand },
})
