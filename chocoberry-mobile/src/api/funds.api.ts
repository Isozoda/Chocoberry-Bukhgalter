import { apiClient } from './axios'
import type { Fund, FundTransaction, FundTransactionDto } from '@/types/fund.types'

export const fundsApi = {
  list: (): Promise<Fund[]> =>
    apiClient.get('/funds'),

  create: (dto: { name: string; type: string }): Promise<Fund> =>
    apiClient.post('/funds', dto),

  getById: (id: string): Promise<Fund> =>
    apiClient.get(`/funds/${id}`),

  deposit: (id: string, dto: FundTransactionDto): Promise<Fund> =>
    apiClient.post(`/funds/${id}/deposit`, dto),

  withdraw: (id: string, dto: FundTransactionDto): Promise<Fund> =>
    apiClient.post(`/funds/${id}/withdraw`, dto),

  transactions: (id: string): Promise<FundTransaction[]> =>
    apiClient.get(`/funds/${id}/transactions`),
}
