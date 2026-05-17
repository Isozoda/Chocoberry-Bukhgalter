import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import { useTheme } from '@theme/index'
import { fontSize, spacing } from '@theme/index'

interface Props {
  label: string
  value: boolean
  onValueChange: (v: boolean) => void
}

export function SwitchField({ label, value, onValueChange }: Props) {
  const { colors } = useTheme()
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.brand }}
        thumbColor="#fff"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[3] },
  label: { fontSize: fontSize.base },
})
