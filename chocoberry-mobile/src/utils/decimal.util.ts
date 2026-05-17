import Decimal from 'decimal.js'

export const toDecimal = (v: string | number | Decimal): Decimal =>
  new Decimal(v.toString())

export const formatMoney = (v: string | number | Decimal): string => {
  const d = new Decimal(v.toString())
  const parts = d.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.') + ' см'
}

export const formatMoneyRaw = (v: string | number | Decimal): string => {
  const d = new Decimal(v.toString())
  const parts = d.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export const addMoney = (...vals: (string | number | Decimal)[]): Decimal =>
  vals.reduce((a, v) => a.plus(new Decimal(v.toString())), new Decimal(0))

export const multiplyMoney = (a: string | number, b: string | number): Decimal =>
  new Decimal(a.toString()).times(new Decimal(b.toString()))

export const subtractMoney = (a: string | number, b: string | number): Decimal =>
  new Decimal(a.toString()).minus(new Decimal(b.toString()))

export const divideMoney = (a: string | number, b: string | number): Decimal =>
  new Decimal(a.toString()).dividedBy(new Decimal(b.toString()))

export const maxZero = (v: Decimal): Decimal =>
  Decimal.max(new Decimal(0), v)

export const isPositive = (v: string | number | Decimal): boolean =>
  new Decimal(v.toString()).greaterThan(0)

export const calcDailyFormula = (
  totalSales: string,
  extraIncome: string,
  operational: string,
  consumables: string,
  ownerDraws: string,
  supplierPurchases: string
) => {
  const totalIncome = addMoney(totalSales, extraIncome)
  const totalExpenses = addMoney(operational, consumables, ownerDraws, supplierPurchases)
  const remaining = subtractMoney(totalIncome.toString(), totalExpenses.toString())
  const charity = maxZero(remaining)
  return { totalIncome, totalExpenses, remaining, charity }
}
