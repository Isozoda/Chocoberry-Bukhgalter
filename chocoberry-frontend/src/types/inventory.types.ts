export type InventoryCategory = 'FRUIT' | 'CHOCOLATE' | 'PACKAGING' | 'OTHER'
export type InventoryUnit = 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'BOX' | 'PACK' | 'BLOCK' | 'DOZEN' | 'TON'
export type InventoryHistoryType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE' | 'CLEANING_LOSS' | 'TRANSFER'

export interface InventoryItem {
  id: string
  name: string
  nameRu?: string | null
  nameTg?: string | null
  category?: string | null
  unit: InventoryUnit
  currentStock: string
  minStockLevel: string
  avgCost: string
  cleaningLossPct: string
  businessId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InventoryHistory {
  id: string
  inventoryItemId: string
  type: InventoryHistoryType
  quantity: string
  unitCost: string
  totalCost: string
  stockBefore: string
  stockAfter: string
  reason?: string | null
  notes?: string | null
  date: string
  createdAt: string
}

export interface StockInDto {
  quantity: number
  unitCost?: number
  notes?: string
  date?: string
}

export interface StockOutDto {
  quantity: number
  reason?: string
  notes?: string
  date?: string
}

export interface AdjustDto {
  newQuantity: number
  reason?: string
  notes?: string
}

export interface WasteDto {
  quantity: number
  reason: string
  notes?: string
  date?: string
}

export interface CleaningDto {
  rawQuantity: number
  actualCleanedQuantity?: number
  notes?: string
}

export interface CleaningResult {
  raw: string
  cleaned: string
  loss: string
  lossPct: string
  stockBefore: string
  stockAfter: string
  outTransactionId: string
  inTransactionId: string
}

export interface InventoryValuation {
  totalValue: string
  items: Array<{
    id: string
    name: string
    stock: string
    avgCost: string
    value: string
  }>
}

export interface LowStockItem {
  id: string
  name: string
  currentStock: string
  minStockLevel: string
  unit: InventoryUnit
}
