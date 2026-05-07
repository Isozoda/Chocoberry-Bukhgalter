export interface DateRangeParams {
  from: string
  to: string
}

export interface ProfitReport {
  from: string
  to: string
  totalRevenue: string
  totalCOGS: string
  grossProfit: string
  totalExpenses: string
  netProfit: string
  daily: Array<{
    date: string
    revenue: string
    cogs: string
    expenses: string
    profit: string
  }>
}

export interface CashflowReport {
  from: string
  to: string
  openingBalance: string
  closingBalance: string
  totalInflows: string
  totalOutflows: string
  daily: Array<{
    date: string
    inflows: string
    outflows: string
    balance: string
  }>
}

export interface COGSReport {
  from: string
  to: string
  totalCOGS: string
  byProduct: Array<{
    productId: string
    name: string
    qtySold: number
    cogs: string
  }>
}

export interface MonthlyReport {
  month: string
  revenue: string
  expenses: Record<string, string>
  totalExpenses: string
  netProfit: string
  topProducts: Array<{ name: string; qty: number; revenue: string }>
}

export interface TopProductsReport {
  from: string
  to: string
  products: Array<{
    rank: number
    productId: string
    nameTg: string
    nameRu: string
    qtySold: number
    revenue: string
    cost: string
    margin: string
  }>
}

export interface HotHoursReport {
  from: string
  to: string
  peakHour: number
  heatmap: Array<{ hour: number; dayOfWeek: number; count: number }>
}

export interface SupplierBreakdownReport {
  from: string
  to: string
  suppliers: Array<{
    supplierId: string
    name: string
    total: string
    purchaseCount: number
    percentage: string
  }>
}

export interface PayrollReport {
  month: string
  employees: Array<{
    employeeId: string
    name: string
    baseSalary: string
    bonus: string
    fines: string
    advances: string
    final: string
  }>
  totalPayroll: string
}
