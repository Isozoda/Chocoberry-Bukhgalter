export type FundType = 'CHARITY' | 'RESERVE' | 'RENOVATION' | 'EMERGENCY' | 'TAX_RESERVE'

export interface Fund {
  id: string
  name: string
  type: FundType
  balance: string
  businessId: string
  createdAt: string
}

export interface FundTransaction {
  id: string
  fundId: string
  type: 'DEPOSIT' | 'WITHDRAWAL'
  amount: string
  notes?: string
  balanceAfter: string
  createdAt: string
}

export interface FundTransactionDto {
  amount: string
  notes?: string
}
