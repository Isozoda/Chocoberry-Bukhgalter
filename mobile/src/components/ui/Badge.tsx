import { View, Text, StyleSheet } from 'react-native'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'

interface Props { label: string; variant?: Variant }

export function Badge({ label, variant = 'default' }: Props) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
    borderRadius: Radius.full, alignSelf: 'flex-start',
  },
  text: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  default: { backgroundColor: Colors.surfaceSecondary },
  defaultText: { color: Colors.text },
  success: { backgroundColor: Colors.successLight },
  successText: { color: Colors.success },
  warning: { backgroundColor: Colors.warningLight },
  warningText: { color: Colors.warning },
  error: { backgroundColor: Colors.errorLight },
  errorText: { color: Colors.error },
  info: { backgroundColor: Colors.infoLight },
  infoText: { color: Colors.info },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  outlineText: { color: Colors.textSecondary },
})
