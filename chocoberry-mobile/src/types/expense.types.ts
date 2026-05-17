export type ExpenseType = 'FIXED' | 'VARIABLE' | 'PAYROLL' | 'OWNER_DRAW' | 'CONSUMABLE' | 'WASTE' | 'FUND'
export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED'

export interface Expense {
  id: string
  expenseType: ExpenseType
  amount: string
  description?: string
  vendor?: string
  employeeId?: string
  employee?: { name: string }
  paymentMethod: PaymentMethod
  date: string
  businessId: string
  createdAt: string
}

export interface CreateExpenseDto {
  expenseType: ExpenseType
  amount: string
  description?: string
  vendor?: string
  employeeId?: string
  paymentMethod: PaymentMethod
  date: string
}

export interface ExpenseBreakdown {
  expenseType: ExpenseType
  total: string
  count: number
}
