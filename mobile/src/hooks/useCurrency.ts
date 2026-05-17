import { formatMoney } from '../utils/decimal.util'
import type Decimal from 'decimal.js'

export const useCurrency = () => {
  const formatTJS = (amount: string | number | Decimal): string => formatMoney(amount)
  return { formatTJS, symbol: 'см' }
}
