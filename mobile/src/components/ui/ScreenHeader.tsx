import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Colors, FontSize, FontWeight, Spacing } from '../../theme/colors'

interface Props {
  title: string
  subtitle?: string
  showBack?: boolean
  right?: React.ReactNode
}

export function ScreenHeader({ title, subtitle, showBack = false, right }: Props) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>CB</Text>
          </View>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right && <View style={styles.right}>{right}</View>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: Spacing.sm, padding: 4 },
  logoMark: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoText: { color: '#fff', fontSize: 12, fontWeight: FontWeight.bold },
  titleWrap: { flex: 1 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  right: { marginLeft: Spacing.sm },
})
