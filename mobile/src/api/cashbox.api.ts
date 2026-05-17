import api from './axios'
import type { CashboxBalance, CashboxOperation, CashboxOperationDto, CashboxTodayReport } from '../types/cashbox.types'
import type { PaginatedResponse } from '../types/api.types'

export const cashboxApi = {
  getBalance: (): Promise<CashboxBalance> => api.get('/cashbox/balance'),
  getHistory: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<CashboxOperation>> =>
    api.get('/cashbox/history', { params }),
  operation: (dto: CashboxOperationDto): Promise<CashboxOperation> => api.post('/cashbox/operation', dto),
  openSession: (dto?: { amount?: number; description?: string }): Promise<CashboxOperation> =>
    api.post('/cashbox/open-session', dto || {}),
  closeSession: (dto?: { amount?: number; description?: string }): Promise<CashboxOperation> =>
    api.post('/cashbox/close-session', dto || {}),
  getTodayReport: (): Promise<CashboxTodayReport> => api.get('/cashbox/today'),
}
