import React from 'react'
import { View } from 'react-native'
import { useTheme } from '@theme/index'

export function Divider({ margin = 0 }: { margin?: number }) {
  const { colors } = useTheme()
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: margin }} />
}
