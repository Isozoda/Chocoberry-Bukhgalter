export type FundType = 'CHARITY' | 'RESERVE' | 'RENOVATION' | 'EMERGENCY' | 'TAX_RESERVE' | 'OTHER'
export type FundTransactionType = 'INCOME' | 'EXPENSE'

export interface Fund {
  id: string; type: FundType; name: string; balance: string
  businessId: string; notes?: string; createdAt: string; updatedAt: string
}

export interface FundTransaction {
  id: string; fundId: string; type: FundTransactionType
  amount: string; notes?: string; date: string; createdAt: string
}

export interface FundTransactionDto { type: FundTransactionType; amount: string; notes?: string }
