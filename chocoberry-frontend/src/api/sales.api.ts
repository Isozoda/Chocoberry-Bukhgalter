import api from './axios'
import type { Sale, CreateSaleDto, SalesTodayStats, TopProduct, HotHour } from '@/types/sale.types'
import type { PaginatedResponse } from '@/types/api.types'

export const salesApi = {
  list: (params?: {
    from?: string
    to?: string
    paymentMethod?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Sale>> =>
    api.get('/sales', { params }),

  create: (dto: CreateSaleDto): Promise<Sale> =>
    api.post('/sales', dto),

  getById: (id: string): Promise<Sale> =>
    api.get(`/sales/${id}`),

  void: (id: string): Promise<Sale> =>
    api.patch(`/sales/${id}/void`),

  statsToday: (): Promise<SalesTodayStats> =>
    api.get('/sales/stats/today'),

  topProducts: (params?: { from?: string; to?: string; limit?: number }): Promise<TopProduct[]> =>
    api.get('/sales/stats/top-products', { params }),

  hotHours: (params?: { from?: string; to?: string }): Promise<HotHour[]> =>
    api.get('/sales/stats/hot-hours', { params }),
}
