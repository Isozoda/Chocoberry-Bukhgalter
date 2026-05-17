import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight, spacing, radius } from '@theme/index'
import { MoneyText } from './MoneyText'

interface Props {
  title: string
  value: string
  isMoney?: boolean
  change?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  iconBg?: string
}

export function StatsCard({ title, value, isMoney, change, icon, iconColor, iconBg }: Props) {
  const { colors } = useTheme()
  const isPositiveChange = change && !change.startsWith('-')

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: iconBg ?? colors.surfaceAlt, borderRadius: radius.md }]}>
          <Ionicons name={icon} size={20} color={iconColor ?? colors.brand} />
        </View>
      )}
      <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>
      {isMoney ? (
        <MoneyText amount={value} size={fontSize.xl} bold />
      ) : (
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      )}
      {change && (
        <Text style={[styles.change, { color: isPositiveChange ? colors.green : colors.red }]}>
          {isPositiveChange ? '▲' : '▼'} {change}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  iconWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  value: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  change: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
})
