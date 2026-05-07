import api from './axios'
import type { Expense, CreateExpenseDto, ExpenseCategory, ExpenseBreakdown } from '@/types/expense.types'
import type { PaginatedResponse } from '@/types/api.types'

export const expensesApi = {
  list: (params?: {
    expenseType?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Expense>> =>
    api.get('/expenses', { params }),

  create: (dto: CreateExpenseDto): Promise<Expense> =>
    api.post('/expenses', dto),

  getById: (id: string): Promise<Expense> =>
    api.get(`/expenses/${id}`),

  update: (id: string, dto: Partial<CreateExpenseDto>): Promise<Expense> =>
    api.patch(`/expenses/${id}`, dto),

  delete: (id: string): Promise<void> =>
    api.delete(`/expenses/${id}`),

  getCategories: (expenseType?: string): Promise<ExpenseCategory[]> =>
    api.get('/expenses/categories', { params: { expenseType } }),

  getBreakdown: (params?: { from?: string; to?: string }): Promise<ExpenseBreakdown[]> =>
    api.get('/expenses/breakdown', { params }),
}
