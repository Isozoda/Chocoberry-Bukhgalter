import Decimal from 'decimal.js'

export const toDecimal = (value: string | number | Decimal | undefined | null): Decimal => {
  if (value === undefined || value === null || value === '' || value.toString() === 'NaN') {
    return new Decimal(0)
  }
  try {
    return new Decimal(value.toString())
  } catch {
    return new Decimal(0)
  }
}

export const formatMoney = (value: string | number | Decimal | undefined | null): string => {
  const d = toDecimal(value)
  return d.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' см'
}

export const addMoney = (...values: (string | number | Decimal)[]): Decimal =>
  values.reduce<Decimal>((acc, v) => acc.plus(new Decimal(v.toString())), new Decimal(0))

export const multiplyMoney = (a: string | number | Decimal, b: string | number | Decimal): Decimal =>
  new Decimal(a.toString()).times(new Decimal(b.toString()))

export const subtractMoney = (a: string | number | Decimal, b: string | number | Decimal): Decimal =>
  new Decimal(a.toString()).minus(new Decimal(b.toString()))

export const isPositive = (value: string | number | Decimal): boolean =>
  new Decimal(value.toString()).gt(0)

export const isNegative = (value: string | number | Decimal): boolean =>
  new Decimal(value.toString()).lt(0)
