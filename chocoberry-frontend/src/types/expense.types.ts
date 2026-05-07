export type ExpenseType =
  | 'FIXED'
  | 'VARIABLE'
  | 'PAYROLL'
  | 'OWNER_DRAW'
  | 'CONSUMABLE'
  | 'COGS'
  | 'WASTE'
  | 'FUND'
  | 'OTHER'

export interface ExpenseCategory {
  id: string
  name: string
  nameRu?: string | null
  nameTg?: string | null
  expenseType?: ExpenseType | null
  type: string
  businessId: string
  isDefault: boolean
}

export interface Expense {
  id: string
  expenseType: ExpenseType
  categoryId?: string | null
  category?: ExpenseCategory | null
  amount: string
  description?: string | null
  vendor?: string | null
  employeeId?: string | null
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED'
  isPaid: boolean
  date: string
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseDto {
  expenseType: ExpenseType
  categoryId?: string
  amount: number
  description?: string
  vendor?: string
  employeeId?: string
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED'
  date?: string
}

export interface ExpenseBreakdown {
  type: ExpenseType
  total: string
  count: number
}
