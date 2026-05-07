export type BusinessType = 'FOOD' | 'RETAIL' | 'SERVICE' | 'OTHER'

export interface Business {
  id: string
  name: string
  type: BusinessType
  address?: string
  phone?: string
  bonusPercent: string
  userId: string
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  cashbox?: { balance: string; cardBalance: string }
}

export interface CreateBusinessDto {
  name: string
  type: BusinessType
  address?: string
  phone?: string
  bonusPercent?: string
}

export interface BusinessDashboard {
  todaySales: string
  todayCash: string
  todayCard: string
  todaySaleCount: number
  cashboxBalance: string
  cardBalance: string
  totalBalance: string
  todayExpenses: string
  lowStockCount: number
  last7DaysSales: Array<{ date: string; total: string; count: number }>
}

export interface SetupResponse {
  business: Business
  inventoryCount: number
  productCount: number
  employeeCount: number
  fundCount: number
  supplierCount: number
  categoryCount: number
}
