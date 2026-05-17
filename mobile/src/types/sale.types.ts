export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED'
export type SaleStatus = 'COMPLETED' | 'REFUNDED' | 'VOID'

export interface SaleItem {
  id: string; saleId: string; productId?: string | null
  product?: { id: string; name: string; nameTg?: string; nameRu?: string; price: string } | null
  name: string; quantity: string; unitPrice: string; cost: string; total: string
}

export interface Sale {
  id: string; saleNumber: string; items: SaleItem[]; subtotal: string
  discount: string; tax: string; total: string; paymentMethod: PaymentMethod
  cashAmount: string; cardAmount: string; status: SaleStatus
  businessId: string; employeeId?: string | null; notes?: string | null
  date: string; createdAt: string
}

export interface CreateSaleDto {
  items: Array<{ productId?: string; name?: string; quantity: number; unitPrice?: number }>
  paymentMethod: PaymentMethod; cashAmount?: number; cardAmount?: number
  discount?: number; tax?: number; employeeId?: string; notes?: string
}

export interface SalesTodayStats {
  totalSales: string; cashSales: string; cardSales: string
  totalDiscount: string; saleCount: number; vsYesterday: number
}

export interface TopProduct {
  productId?: string | null; name: string; qty: number; revenue: string; count: number
}

export interface HotHour { hour: number; count: number; revenue: string }
