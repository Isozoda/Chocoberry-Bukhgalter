import React from 'react'
import { Text, TextStyle } from 'react-native'
import Decimal from 'decimal.js'
import { formatMoney } from '@utils/decimal.util'
import { useTheme } from '@theme/index'
import { fontSize, fontWeight } from '@theme/index'

interface Props {
  amount: string | number | Decimal
  size?: number
  color?: string
  bold?: boolean
  style?: TextStyle
}

export function MoneyText({ amount, size, color, bold, style }: Props) {
  const { colors } = useTheme()
  return (
    <Text
      style={[
        {
          fontSize: size ?? fontSize.base,
          fontWeight: bold ? fontWeight.bold : fontWeight.medium,
          color: color ?? colors.textPrimary,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
    >
      {formatMoney(amount)}
    </Text>
  )
}
