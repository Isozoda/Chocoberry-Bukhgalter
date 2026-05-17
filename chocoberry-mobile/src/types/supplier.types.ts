export type SupplierType = 'FRUIT' | 'CHOCOLATE' | 'CONSUMABLE' | 'OTHER'

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  phone?: string
  address?: string
  totalPurchases: string
  businessId: string
  createdAt: string
}

export interface CreateSupplierDto {
  name: string
  type: SupplierType
  phone?: string
  address?: string
}

export type InventoryUnit = 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'BOX' | 'PACK' | 'BLOCK' | 'TON'

export interface SupplierPurchaseDto {
  inventoryItemId: string
  unit: InventoryUnit
  quantity?: string
  boxCount?: number
  kgPerBox?: string
  pricePerUnit: string
  notes?: string
}

export interface SupplierPurchase {
  id: string
  supplierId: string
  inventoryItemId: string
  inventoryItem: { name: string }
  unit: InventoryUnit
  quantity: string
  totalKg: string
  pricePerUnit: string
  totalAmount: string
  notes?: string
  createdAt: string
}

export interface PriceHistory {
  id: string
  supplierId: string
  inventoryItemId: string
  pricePerUnit: string
  recordedAt: string
}
