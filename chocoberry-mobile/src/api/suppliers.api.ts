import { apiClient } from './axios'
import type { Supplier, CreateSupplierDto, SupplierPurchase, SupplierPurchaseDto, PriceHistory } from '@/types/supplier.types'
import type { PaginatedResponse } from '@/types/api.types'

export const suppliersApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<Supplier>> =>
    apiClient.get('/suppliers', { params }),

  create: (dto: CreateSupplierDto): Promise<Supplier> =>
    apiClient.post('/suppliers', dto),

  getById: (id: string): Promise<Supplier> =>
    apiClient.get(`/suppliers/${id}`),

  update: (id: string, dto: Partial<CreateSupplierDto>): Promise<Supplier> =>
    apiClient.patch(`/suppliers/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/suppliers/${id}`),

  purchase: (id: string, dto: SupplierPurchaseDto): Promise<SupplierPurchase> =>
    apiClient.post(`/suppliers/${id}/purchase`, dto),

  getPurchases: (id: string, params?: Record<string, unknown>): Promise<PaginatedResponse<SupplierPurchase>> =>
    apiClient.get(`/suppliers/${id}/purchases`, { params }),

  getPriceHistory: (id: string, params?: Record<string, unknown>): Promise<PriceHistory[]> =>
    apiClient.get(`/suppliers/${id}/price-history`, { params }),

  breakdown: (params?: Record<string, unknown>): Promise<unknown> =>
    apiClient.get('/suppliers/breakdown', { params }),
}
