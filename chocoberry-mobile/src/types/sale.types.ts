export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED'
export type SaleStatus = 'COMPLETED' | 'REFUNDED' | 'VOID'

export interface SaleItem {
  id: string
  productId: string
  product: { name: string; price: string }
  quantity: number
  unitPrice: string
  totalPrice: string
}

export interface Sale {
  id: string
  saleNumber: string
  items: SaleItem[]
  subtotal: string
  discount: string
  total: string
  paymentMethod: PaymentMethod
  cashAmount: string
  cardAmount: string
  status: SaleStatus
  businessId: string
  createdAt: string
}

export interface CreateSaleItemDto {
  productId: string
  quantity: number
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[]
  paymentMethod: PaymentMethod
  cashAmount?: string
  cardAmount?: string
  discount?: string
}

export interface SalesTodayStats {
  totalSales: string
  cashSales: string
  cardSales: string
  orderCount: number
  avgOrderValue: string
}
