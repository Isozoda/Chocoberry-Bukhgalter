import api from './axios'

export interface FixedExpense {
  id: string
  businessId: string
  name: string
  category: string
  amount: string
  currency: string
  period: string
  dueDate: string
  paidAt: string | null
  isPaid: boolean
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface FixedExpenseSummary {
  totalPaid: string
  totalPending: string
  count: number
  paidCount: number
}

export interface CreateFixedExpenseDto {
  name: string
  category: string
  amount: number
  currency?: string
  period: string
  dueDate: string
  isPaid?: boolean
  paidAt?: string
  note?: string
}

export const fixedExpensesApi = {
  list: (params?: { month?: string; isPaid?: string }): Promise<FixedExpense[]> =>
    api.get('/fixed-expenses', { params }),

  summary: (month?: string): Promise<FixedExpenseSummary> =>
    api.get('/fixed-expenses/summary', { params: { month } }),

  create: (dto: CreateFixedExpenseDto): Promise<FixedExpense> =>
    api.post('/fixed-expenses', dto),

  update: (id: string, dto: Partial<CreateFixedExpenseDto>): Promise<FixedExpense> =>
    api.patch(`/fixed-expenses/${id}`, dto),

  markPaid: (id: string): Promise<FixedExpense> =>
    api.patch(`/fixed-expenses/${id}/pay`),

  delete: (id: string): Promise<void> =>
    api.delete(`/fixed-expenses/${id}`),
}
