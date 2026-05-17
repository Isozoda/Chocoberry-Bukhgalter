import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'

interface Props {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = 'folder-open-outline', title, subtitle, action }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={Colors.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  action: { marginTop: Spacing.lg },
})
