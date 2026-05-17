export type SupplierType = 'FRUIT' | 'CHOCOLATE' | 'PACKAGING' | 'OTHER'
export type PurchaseUnit = 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'BOX' | 'PACK' | 'BLOCK' | 'DOZEN' | 'TON'

export interface Supplier {
  id: string; name: string; type: SupplierType; phone?: string
  isActive: boolean; businessId: string; createdAt: string; updatedAt: string
}

export interface CreateSupplierDto { name: string; type: SupplierType; phone?: string; isActive?: boolean }

export interface SupplierPurchase {
  id: string; supplierId: string; inventoryItemId: string
  inventoryItem?: { id: string; name: string; unit: string }
  unit: PurchaseUnit; quantity: string; pricePerUnit: string; totalAmount: string
  notes?: string; createdAt: string
}

export interface PurchaseDto {
  inventoryItemId: string; unit: PurchaseUnit; quantity?: string
  boxCount?: number; kgPerBox?: string; pricePerUnit: string; notes?: string
}

export interface SupplierBreakdown {
  supplierId: string; supplierName: string; total: string; purchaseCount: number
}
