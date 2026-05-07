export type DailyReportStatus = 'DRAFT' | 'FINALIZED'

export interface DailyReportLocation {
  label: string
  amount: string
}

export interface DailyReportExtraIncome {
  label: string
  amount: string
}

export interface DailyReportConsumable {
  employeeId: string
  employeeName?: string
  amount: string
}

export interface DailyReportOwnerDraw {
  employeeId: string
  employeeName?: string
  amount: string
}

export interface DailyReportSupplierPurchase {
  supplierId: string
  supplierName?: string
  amount: string
}

export interface DailyReport {
  id: string
  date: string
  totalSales: string
  locations: DailyReportLocation[]
  extraIncome: DailyReportExtraIncome[]
  totalExtraIncome: string
  operationalExp: string
  consumables: DailyReportConsumable[]
  ownerDraws: DailyReportOwnerDraw[]
  supplierPurchases: DailyReportSupplierPurchase[]
  totalExpenses: string
  charityAmount: string
  remainingCash: string
  status: DailyReportStatus
  notes?: string
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDailyReportDto {
  date: string
  totalSales: string
  locations?: DailyReportLocation[]
  extraIncome?: DailyReportExtraIncome[]
  operationalExp?: string
  consumables?: DailyReportConsumable[]
  ownerDraws?: DailyReportOwnerDraw[]
  supplierPurchases?: DailyReportSupplierPurchase[]
  charityAmount?: string
  notes?: string
}

export interface DailyReportSummary {
  totalIncome: string
  totalExpenses: string
  charityAmount: string
  remainingCash: string
  breakdown: {
    salesIncome: string
    extraIncome: string
    operationalExp: string
    consumables: string
    ownerDraws: string
    supplierPurchases: string
  }
}
