import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight, spacing } from '@theme/index'

interface Props {
  title: string
  right?: React.ReactNode
}

export function SectionHeader({ title, right }: Props) {
  const { colors } = useTheme()
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
})
