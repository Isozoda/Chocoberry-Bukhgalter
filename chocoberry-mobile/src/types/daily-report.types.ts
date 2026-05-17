export type DailyReportStatus = 'DRAFT' | 'FINALIZED'

export interface SalesByLocation {
  name: string
  amount: string
}

export interface ExtraIncome {
  name: string
  amount: string
}

export interface OwnerDraw {
  employeeId: string
  employeeName: string
  amount: string
}

export interface ConsumablePurchase {
  employeeId: string
  employeeName: string
  amount: string
}

export interface SupplierExpense {
  supplierId?: string
  supplierName: string
  amount: string
}

export interface DailyReport {
  id: string
  date: string
  status: DailyReportStatus
  totalSales: string
  extraIncome: ExtraIncome[]
  totalIncome: string
  operationalExpenses: string
  consumables: ConsumablePurchase[]
  ownerDraws: OwnerDraw[]
  supplierPurchases: SupplierExpense[]
  totalExpenses: string
  charityFund: string
  remaining: string
  salesByLocation: SalesByLocation[]
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDailyReportDto {
  date: string
  totalSales: string
  extraIncome?: ExtraIncome[]
  operationalExpenses?: string
  consumables?: ConsumablePurchase[]
  ownerDraws?: OwnerDraw[]
  supplierPurchases?: SupplierExpense[]
  salesByLocation?: SalesByLocation[]
}
