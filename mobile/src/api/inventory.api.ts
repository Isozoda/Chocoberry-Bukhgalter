import api from './axios'
import type { InventoryItem, InventoryHistory, StockInDto, StockOutDto, AdjustDto, WasteDto, CleaningDto, LowStockItem, InventoryValuation } from '../types/inventory.types'
import type { PaginatedResponse } from '../types/api.types'

export const inventoryApi = {
  list: (params?: { category?: string; page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<InventoryItem>> =>
    api.get('/inventory', { params }),
  create: (dto: Partial<InventoryItem>): Promise<InventoryItem> => api.post('/inventory', dto),
  getById: (id: string): Promise<InventoryItem> => api.get(`/inventory/${id}`),
  update: (id: string, dto: Partial<InventoryItem>): Promise<InventoryItem> => api.patch(`/inventory/${id}`, dto),
  delete: (id: string): Promise<void> => api.delete(`/inventory/${id}`),
  stockIn: (id: string, dto: StockInDto): Promise<InventoryHistory> => api.post(`/inventory/${id}/stock-in`, dto),
  stockOut: (id: string, dto: StockOutDto): Promise<InventoryHistory> => api.post(`/inventory/${id}/stock-out`, dto),
  adjust: (id: string, dto: AdjustDto): Promise<InventoryHistory> => api.post(`/inventory/${id}/adjust`, dto),
  waste: (id: string, dto: WasteDto): Promise<InventoryHistory> => api.post(`/inventory/${id}/waste`, dto),
  cleaning: (id: string, dto: CleaningDto) => api.post(`/inventory/${id}/cleaning`, dto),
  getHistory: (id: string, params?: { page?: number; limit?: number; from?: string; to?: string }): Promise<PaginatedResponse<InventoryHistory>> =>
    api.get(`/inventory/${id}/history`, { params }),
  getLowStock: (): Promise<LowStockItem[]> => api.get('/inventory/alerts/low-stock'),
  valuation: (): Promise<InventoryValuation> => api.get('/inventory/valuation'),
}
