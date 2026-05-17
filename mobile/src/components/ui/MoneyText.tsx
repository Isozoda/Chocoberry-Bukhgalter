import { Text, StyleSheet, type TextStyle } from 'react-native'
import { formatMoney } from '../../utils/decimal.util'
import { Colors, FontSize, FontWeight } from '../../theme/colors'

interface Props {
  amount: string | number | undefined | null
  style?: TextStyle
  color?: string
  size?: number
}

export function MoneyText({ amount, style, color = Colors.text, size = FontSize.md }: Props) {
  return (
    <Text style={[styles.base, { color, fontSize: size }, style]}>
      {formatMoney(amount ?? 0)}
    </Text>
  )
}

const styles = StyleSheet.create({
  base: { fontWeight: FontWeight.semibold, fontVariant: ['tabular-nums'] },
})
