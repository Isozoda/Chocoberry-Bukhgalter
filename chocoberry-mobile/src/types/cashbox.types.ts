export type CashboxMovementType = 'SALE_CASH' | 'SALE_CARD' | 'IN' | 'OUT' | 'EXPENSE'

export interface Cashbox {
  id: string
  cashBalance: string
  cardBalance: string
  isOpen: boolean
  businessId: string
  updatedAt: string
}

export interface CashboxMovement {
  id: string
  type: CashboxMovementType
  cashAmount: string
  cardAmount: string
  balanceBefore: string
  balanceAfter: string
  description?: string
  createdAt: string
}

export interface CashboxDto {
  amount: string
  description?: string
}
