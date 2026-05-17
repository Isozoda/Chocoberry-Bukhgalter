import { formatMoney } from '@utils/decimal.util'
import type Decimal from 'decimal.js'

export function useCurrency() {
  const format = (amount: string | number | Decimal): string => formatMoney(amount)
  const symbol = process.env.EXPO_PUBLIC_CURRENCY_SYMBOL ?? 'см'
  return { format, symbol }
}
