import api from './axios'
import type { Fund, FundTransaction, FundTransactionDto } from '../types/fund.types'

export const fundsApi = {
  list: (): Promise<Fund[]> => api.get('/funds'),
  create: (dto: { type: string; name: string; notes?: string }): Promise<Fund> => api.post('/funds', dto),
  getById: (id: string): Promise<Fund> => api.get(`/funds/${id}`),
  deposit: (id: string, dto: { amount: string; notes?: string }): Promise<FundTransaction> =>
    api.post(`/funds/${id}/deposit`, dto),
  withdraw: (id: string, dto: { amount: string; notes?: string }): Promise<FundTransaction> =>
    api.post(`/funds/${id}/withdraw`, dto),
  getTransactions: (id: string, params?: { page?: number; limit?: number }): Promise<FundTransaction[]> =>
    api.get(`/funds/${id}/transactions`, { params }),
}
