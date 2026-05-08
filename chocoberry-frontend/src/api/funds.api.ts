import api from './axios'
import type { Fund, FundTransaction, FundTransactionDto, FundType } from '@/types/fund.types'

export interface CreateFundDto {
  type: FundType
  name: string
  notes?: string
}

export const fundsApi = {
  list: (): Promise<Fund[]> =>
    api.get('/funds'),

  create: (dto: CreateFundDto): Promise<Fund> =>
    api.post('/funds', dto),

  getById: (id: string): Promise<Fund> =>
    api.get(`/funds/${id}`),

  addTransaction: (id: string, dto: FundTransactionDto): Promise<FundTransaction> => {
    const endpoint = dto.type === 'INCOME' ? `/funds/${id}/deposit` : `/funds/${id}/withdraw`
    return api.post(endpoint, { amount: dto.amount, notes: dto.notes })
  },

  deposit: (id: string, dto: { amount: string; notes?: string }): Promise<FundTransaction> =>
    api.post(`/funds/${id}/deposit`, dto),

  withdraw: (id: string, dto: { amount: string; notes?: string }): Promise<FundTransaction> =>
    api.post(`/funds/${id}/withdraw`, dto),

  getTransactions: (id: string, params?: { page?: number; limit?: number }): Promise<FundTransaction[]> =>
    api.get(`/funds/${id}/transactions`, { params }),
}
