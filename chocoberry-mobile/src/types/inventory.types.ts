export type InventoryUnit = 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'BOX' | 'PACK' | 'BLOCK' | 'TON'
export type InventoryCategory = 'FRUIT' | 'CHOCOLATE' | 'CONSUMABLE' | 'OTHER'

export interface InventoryItem {
  id: string
  name: string
  unit: InventoryUnit
  category: InventoryCategory
  currentStock: string
  minStockLevel: string
  avgCost: string
  totalValue: string
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryDto {
  name: string
  unit: InventoryUnit
  category: InventoryCategory
  currentStock?: string
  minStockLevel?: string
}

export interface StockMovement {
  id: string
  inventoryItemId: string
  type: 'IN' | 'OUT' | 'ADJUST' | 'WASTE' | 'CLEANING' | 'SALE_DEDUCTION'
  quantity: string
  balanceAfter: string
  reason?: string
  notes?: string
  cost?: string
  createdAt: string
}

export interface CleaningDto {
  rawQuantity: string
  actualCleanedQuantity?: string
  notes?: string
}

export interface CleaningResult {
  rawQuantity: string
  cleanedQuantity: string
  lossQuantity: string
  lossPercentage: string
}
