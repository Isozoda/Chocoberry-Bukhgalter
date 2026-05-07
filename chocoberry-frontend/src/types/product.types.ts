export type CupType = 'CUP_300_ML' | 'CUP_400_ML' | 'CUP_80SM' | 'CUP_90SM' | 'CUP_ICE_CREAM' | 'OTHER'

export interface RecipeItem {
  id: string
  productId: string
  inventoryItemId: string
  inventoryItem?: { id: string; name: string; unit: string; avgCost: string }
  quantity: string
  unit: string
}

export interface Product {
  id: string
  name: string
  nameTg?: string | null
  nameRu?: string | null
  cupType?: CupType | null
  variant?: string | null
  price: string
  cost: string
  unit: string
  category?: string | null
  isActive: boolean
  businessId: string
  recipe?: RecipeItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  name: string
  nameTg?: string
  nameRu?: string
  cupType?: CupType
  variant?: string
  price: string
  unit?: string
  category?: string
  isActive?: boolean
}

export interface RecipeDto {
  items: Array<{
    inventoryItemId: string
    quantity: string
    unit: string
  }>
}
