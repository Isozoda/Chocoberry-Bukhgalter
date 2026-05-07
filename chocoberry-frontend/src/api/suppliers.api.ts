import api from './axios'
import type {
  Supplier,
  CreateSupplierDto,
  SupplierPurchase,
  PurchaseDto,
  PurchaseForecast,
  PriceHistory,
  SupplierBreakdown,
} from '@/types/supplier.types'
import type { PaginatedResponse } from '@/types/api.types'

export const suppliersApi = {
  list: (params?: { type?: string; search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Supplier>> =>
    api.get('/suppliers', { params }),

  create: (dto: CreateSupplierDto): Promise<Supplier> =>
    api.post('/suppliers', dto),

  getById: (id: string): Promise<Supplier> =>
    api.get(`/suppliers/${id}`),

  update: (id: string, dto: Partial<CreateSupplierDto>): Promise<Supplier> =>
    api.patch(`/suppliers/${id}`, dto),

  delete: (id: string): Promise<void> =>
    api.delete(`/suppliers/${id}`),

  purchase: (id: string, dto: PurchaseDto): Promise<PurchaseForecast> =>
    api.post(`/suppliers/${id}/purchase`, dto),

  getPurchases: (
    id: string,
    params?: { from?: string; to?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<SupplierPurchase>> =>
    api.get(`/suppliers/${id}/purchases`, { params }),

  getPriceHistory: (
    id: string,
    params?: { inventoryItemId?: string; from?: string; to?: string }
  ): Promise<PriceHistory[]> =>
    api.get(`/suppliers/${id}/price-history`, { params }),

  breakdown: (params?: { from?: string; to?: string }): Promise<SupplierBreakdown[]> =>
    api.get('/suppliers/breakdown', { params }),
}
