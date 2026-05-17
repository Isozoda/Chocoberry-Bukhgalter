export type PaymentType = 'SALARY' | 'ADVANCE' | 'BONUS'

export interface Employee {
  id: string
  name: string
  position: string
  baseSalary: string
  bonusPercentage: string
  isOwner: boolean
  isConsumableBuyer: boolean
  hiredAt: string
  businessId: string
  createdAt: string
}

export interface CreateEmployeeDto {
  name: string
  position: string
  baseSalary: string
  bonusPercentage?: string
  isOwner?: boolean
  isConsumableBuyer?: boolean
  hiredAt?: string
}

export interface EmployeePayment {
  id: string
  employeeId: string
  type: PaymentType
  amount: string
  period?: string
  notes?: string
  createdAt: string
}

export interface EmployeeFine {
  id: string
  employeeId: string
  amount: string
  reason: string
  date: string
  isApplied: boolean
  createdAt: string
}

export interface PayrollResult {
  employeeId: string
  employee: Employee
  baseSalary: string
  bonusAmount: string
  totalFines: string
  totalAdvances: string
  finalSalary: string
  monthlySales: string
}
