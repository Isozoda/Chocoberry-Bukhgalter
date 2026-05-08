export interface DateRangeParams {
  from: string
  to: string
}

export interface ProfitReport {
  period: { from: string; to: string }
  totalIncome: string
  totalExpenses: string
  netProfit: string
  profitMargin: string
  expenseBreakdown: Array<{ expenseType: string; _sum: { amount: string | null } }>
}

export interface CashflowReport {
  transactions: Array<{
    id: string
    type: 'INCOME' | 'EXPENSE'
    amount: string
    date: string
    notes?: string
    runningBalance: string
  }>
  finalBalance: string
}

export interface COGSReport {
  totalSales: string
  totalCogs: string
  grossProfit: string
  grossMargin: string
}

export interface MonthlyReport {
  period: string
  totalIncome: string
  totalExpenses: string
  netProfit: string
  salesCount: number
  cashSales: string
  cardSales: string
  dailySales: Array<{ date: string; _sum: { total: string | null } }>
  expenseBreakdown: Array<{ expenseType: string; _sum: { amount: string | null } }>
}

export interface TopProductItem {
  rank: number
  productId: string | null
  name: string
  qtySold: number
  revenue: string
}

export type TopProductsReport = TopProductItem[]

export interface HotHourItem {
  hour: number
  count: number
  revenue: string
}

export type HotHoursReport = HotHourItem[]

export interface SupplierBreakdownItem {
  supplierId: string
  name: string
  total: string
  purchaseCount: number
  percentage: string
}

export type SupplierBreakdownReport = SupplierBreakdownItem[]

export interface PayrollEmployeeRow {
  employeeId: string
  name: string
  baseSalary: string
  bonus: string
  advances: string
  fines: string
  final: string
}

export interface PayrollReport {
  month: string
  totalPayroll: string
  employees: PayrollEmployeeRow[]
}
