import { apiClient } from './axios'
import type { InventoryItem, CreateInventoryDto, StockMovement, CleaningDto } from '@/types/inventory.types'
import type { PaginatedResponse } from '@/types/api.types'

export const inventoryApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<InventoryItem>> =>
    apiClient.get('/inventory', { params }),

  create: (dto: CreateInventoryDto): Promise<InventoryItem> =>
    apiClient.post('/inventory', dto),

  getById: (id: string): Promise<InventoryItem> =>
    apiClient.get(`/inventory/${id}`),

  update: (id: string, dto: Partial<CreateInventoryDto>): Promise<InventoryItem> =>
    apiClient.patch(`/inventory/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/inventory/${id}`),

  stockIn: (id: string, dto: { quantity: string; cost?: string; notes?: string }): Promise<InventoryItem> =>
    apiClient.post(`/inventory/${id}/stock-in`, dto),

  stockOut: (id: string, dto: { quantity: string; reason?: string; notes?: string }): Promise<InventoryItem> =>
    apiClient.post(`/inventory/${id}/stock-out`, dto),

  adjust: (id: string, dto: { quantity: string; reason?: string }): Promise<InventoryItem> =>
    apiClient.post(`/inventory/${id}/adjust`, dto),

  waste: (id: string, dto: { quantity: string; notes?: string }): Promise<InventoryItem> =>
    apiClient.post(`/inventory/${id}/waste`, dto),

  cleaning: (id: string, dto: CleaningDto): Promise<unknown> =>
    apiClient.post(`/inventory/${id}/cleaning`, dto),

  getHistory: (id: string): Promise<StockMovement[]> =>
    apiClient.get(`/inventory/${id}/history`),

  getLowStock: (): Promise<InventoryItem[]> =>
    apiClient.get('/inventory/alerts/low-stock'),

  valuation: (): Promise<{ totalValue: string; items: InventoryItem[] }> =>
    apiClient.get('/inventory/valuation'),
}
