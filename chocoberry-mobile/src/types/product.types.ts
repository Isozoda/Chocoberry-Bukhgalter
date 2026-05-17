export type ProductType = 'CUP_03' | 'CUP_04' | 'PRICE_80' | 'PRICE_90' | 'ICE_CREAM' | 'OTHER'

export interface RecipeIngredient {
  id: string
  productId: string
  inventoryItemId: string
  inventoryItem: { id: string; name: string; unit: string; avgCost: string }
  quantity: string
  unit: string
}

export interface Product {
  id: string
  name: string
  type: ProductType
  price: string
  costPrice: string
  businessId: string
  recipe: RecipeIngredient[]
  createdAt: string
}

export interface CreateProductDto {
  name: string
  type: ProductType
  price: string
  costPrice?: string
}

export interface RecipeIngredientDto {
  inventoryItemId: string
  quantity: string
  unit: string
}
