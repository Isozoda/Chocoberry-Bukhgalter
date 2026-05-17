export interface Business {
  id: string
  name: string
  type: string
  address?: string
  phone?: string
  bonusPercentage: string
  createdAt: string
}

export interface BusinessSetupDto {
  name: string
  type: string
  address?: string
  phone?: string
  bonusPercentage?: string
}

export interface DashboardStats {
  todaySales: string
  todayOrders: number
  totalRevenue: string
  lowStockCount: number
  cashBalance: string
  cardBalance: string
  weekSales: { date: string; total: string }[]
}
