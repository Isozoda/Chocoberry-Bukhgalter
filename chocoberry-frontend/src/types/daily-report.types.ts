export type DailyReportStatus = 'DRAFT' | 'FINALIZED'

// Sub-item types used in the form
export interface DailyReportLocation {
  label: string
  amount: string
}

export interface DailyReportExtraIncome {
  label: string
  amount: string
}

export interface DailyReportConsumable {
  label: string
  amount: string
}

export interface DailyReportOwnerDraw {
  ownerName: string
  amount: string
}

export interface DailyReportSupplierPurchase {
  name: string
  supplierId?: string
  amount: string
}

// Backend response shape (matches Prisma DailyReport model)
export interface DailyReportSupplierLine {
  id: string
  reportId: string
  supplierId?: string
  name: string
  amount: string
}

export interface DailyReportOwnerDrawLine {
  id: string
  reportId: string
  employeeId?: string
  ownerName: string
  amount: string
  note?: string
}

export interface DailyReport {
  id: string
  date: string
  // Scalar income fields
  totalSales: string
  cashSales: string
  cardSales: string
  extraIncome: string
  totalIncome: string
  // Scalar expense fields
  suppliersTotal: string
  operationalExp: string
  consumablesExp: string
  ownerDraws: string  // total owner draws amount
  inventoryExp: string
  totalExpenses: string
  // Summary fields
  charityAmount: string
  remaining: string
  notes?: string
  isFinalized: boolean
  businessId: string
  createdAt: string
  updatedAt: string
  // Related records
  suppliers: DailyReportSupplierLine[]
  draws: DailyReportOwnerDrawLine[]
  lines?: any[]
}

// Form DTO (user-friendly, transformed on submit)
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
  date: string
  totalIncome: string
  totalExpenses: string
  charityAmount: string
  remaining: string
  profit: string
  suppliers: DailyReportSupplierLine[]
  ownerDraws: DailyReportOwnerDrawLine[]
}
