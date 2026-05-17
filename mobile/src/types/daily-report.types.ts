export type DailyReportStatus = 'DRAFT' | 'FINALIZED'

export interface DailyReportSupplierLine {
  id: string; reportId: string; supplierId?: string; name: string; amount: string
}

export interface DailyReportOwnerDrawLine {
  id: string; reportId: string; employeeId?: string; ownerName: string; amount: string; note?: string
}

export interface DailyReport {
  id: string; date: string; totalSales: string; cashSales: string; cardSales: string
  extraIncome: string; totalIncome: string; suppliersTotal: string; operationalExp: string
  consumablesExp: string; ownerDraws: string; inventoryExp: string; totalExpenses: string
  charityAmount: string; remaining: string; notes?: string; isFinalized: boolean
  businessId: string; createdAt: string; updatedAt: string
  suppliers: DailyReportSupplierLine[]; draws: DailyReportOwnerDrawLine[]
}

export interface CreateDailyReportDto {
  date: string; totalSales: string
  locations?: Array<{ label: string; amount: string }>
  extraIncome?: Array<{ label: string; amount: string }>
  operationalExp?: string
  consumables?: Array<{ label: string; amount: string }>
  ownerDraws?: Array<{ ownerName: string; amount: string }>
  supplierPurchases?: Array<{ name: string; supplierId?: string; amount: string }>
  charityAmount?: string; notes?: string
}
