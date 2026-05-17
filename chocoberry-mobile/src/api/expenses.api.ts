import { apiClient } from './axios'
import type { Expense, CreateExpenseDto, ExpenseBreakdown } from '@/types/expense.types'
import type { PaginatedResponse } from '@/types/api.types'

export const expensesApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<Expense>> =>
    apiClient.get('/expenses', { params }),

  create: (dto: CreateExpenseDto): Promise<Expense> =>
    apiClient.post('/expenses', dto),

  getById: (id: string): Promise<Expense> =>
    apiClient.get(`/expenses/${id}`),

  update: (id: string, dto: Partial<CreateExpenseDto>): Promise<Expense> =>
    apiClient.patch(`/expenses/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/expenses/${id}`),

  breakdown: (params?: Record<string, unknown>): Promise<ExpenseBreakdown[]> =>
    apiClient.get('/expenses/breakdown', { params }),
}
