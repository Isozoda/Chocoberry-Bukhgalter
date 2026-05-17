import React from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight, spacing, radius } from '@theme/index'

interface Chip {
  key: string
  label: string
}

interface Props {
  chips: Chip[]
  selected: string
  onSelect: (key: string) => void
}

export function FilterChips({ chips, selected, onSelect }: Props) {
  const { colors } = useTheme()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {chips.map((chip) => {
        const isActive = chip.key === selected
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onSelect(chip.key)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.brand : colors.surfaceAlt,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#fff' : colors.textSecondary },
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], gap: spacing[2] },
  chip: { paddingHorizontal: spacing[4], paddingVertical: 7 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
})
