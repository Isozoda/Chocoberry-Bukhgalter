export interface ProfitReport {
  date: string
  revenue: string
  cogs: string
  grossProfit: string
  expenses: string
  netProfit: string
}

export interface CashflowReport {
  date: string
  cashIn: string
  cashOut: string
  netCashflow: string
}

export interface MonthlyReport {
  month: string
  income: Record<string, string>
  expenses: Record<string, string>
  totalIncome: string
  totalExpenses: string
  profit: string
}

export interface TopProduct {
  productId: string
  name: string
  quantity: number
  revenue: string
  margin: string
}

export interface HotHour {
  hour: number
  dayOfWeek: number
  orderCount: number
  revenue: string
}
