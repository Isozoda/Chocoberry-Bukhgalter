import { apiClient } from './axios'
import type { Sale, CreateSaleDto, SalesTodayStats } from '@/types/sale.types'
import type { PaginatedResponse } from '@/types/api.types'

export const salesApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<Sale>> =>
    apiClient.get('/sales', { params }),

  create: (dto: CreateSaleDto): Promise<Sale> =>
    apiClient.post('/sales', dto),

  getById: (id: string): Promise<Sale> =>
    apiClient.get(`/sales/${id}`),

  void: (id: string): Promise<Sale> =>
    apiClient.patch(`/sales/${id}/void`),

  statsToday: (): Promise<SalesTodayStats> =>
    apiClient.get('/sales/stats/today'),

  topProducts: (params?: Record<string, unknown>): Promise<unknown[]> =>
    apiClient.get('/sales/stats/top-products', { params }),

  hotHours: (params?: Record<string, unknown>): Promise<unknown[]> =>
    apiClient.get('/sales/stats/hot-hours', { params }),
}
