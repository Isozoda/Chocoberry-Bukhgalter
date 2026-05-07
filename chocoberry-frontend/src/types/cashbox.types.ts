export type CashboxOperationType = 'CASH_IN' | 'CASH_OUT' | 'IN' | 'OUT' | 'OPEN' | 'CLOSE' | 'ADJUSTMENT'

export interface CashboxBalance {
  id: string
  businessId: string
  cashBalance: string
  cardBalance: string
  totalBalance: string
  currency: string
  lastUpdated: string
}

export interface CashboxOperation {
  id: string
  cashboxId: string
  type: CashboxOperationType
  amount: string
  balanceBefore: string
  balanceAfter: string
  description?: string
  referenceId?: string
  createdAt: string
}

export interface CashboxOperationDto {
  type: CashboxOperationType
  amount: string
  description?: string
  referenceId?: string
}

export interface CashboxTodayReport {
  cashBalance: string
  cardBalance: string
  totalBalance: string
  totalIn: string
  totalOut: string
  netChange: string
  operations: CashboxOperation[]
}
