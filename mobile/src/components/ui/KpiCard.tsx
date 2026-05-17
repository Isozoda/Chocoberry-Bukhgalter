import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MoneyText } from './MoneyText'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme/colors'

interface Props {
  label: string
  value: string | number
  isMoney?: boolean
  icon: keyof typeof Ionicons.glyphMap
  iconBg: string
  change?: number
  sub?: string
}

export function KpiCard({ label, value, isMoney = true, icon, iconBg, change, sub }: Props) {
  const isPositive = change === undefined || change >= 0

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>{label}</Text>
          {isMoney ? (
            <MoneyText amount={value} size={FontSize.xl} style={styles.value} />
          ) : (
            <Text style={styles.value}>{value}</Text>
          )}
          {sub && <Text style={styles.sub}>{sub}</Text>}
          {change !== undefined && (
            <Text style={[styles.change, { color: isPositive ? Colors.success : Colors.error }]}>
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </Text>
          )}
        </View>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
    flex: 1, minWidth: '47%',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 4 },
  value: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  change: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginTop: 3 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.sm },
})
