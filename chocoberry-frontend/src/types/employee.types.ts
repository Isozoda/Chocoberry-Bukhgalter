export type SalaryType = 'MONTHLY' | 'DAILY' | 'HOURLY'
export type PaymentType = 'SALARY' | 'ADVANCE' | 'BONUS' | 'LUNCH' | 'FINE' | 'OWNER_DRAW' | 'OTHER'

export interface Employee {
  id: string
  name: string
  role: string
  salary: string
  salaryType: SalaryType
  bonusPercent: string
  isOwner: boolean
  isConsumableBuyer: boolean
  isActive: boolean
  phone?: string | null
  hireDate: string
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface EmployeePayment {
  id: string
  employeeId: string
  paymentType: PaymentType
  amount: string
  period?: string | null
  notes?: string | null
  paidAt: string
}

export interface EmployeeFine {
  id: string
  employeeId: string
  businessId: string
  amount: string
  reason: string
  isApplied: boolean
  appliedAt?: string | null
  date: string
  createdAt: string
}

export interface EmployeeShift {
  id: string
  employeeId: string
  startTime: string
  endTime?: string | null
  hoursWorked?: string | null
  notes?: string | null
}

export interface PayEmployeeDto {
  paymentType: PaymentType
  amount: number
  period?: string
  notes?: string
}

export interface CreateFineDto {
  amount: number
  reason: string
}

export interface CreateShiftDto {
  startTime: string
  endTime?: string
  hoursWorked?: number
  notes?: string
}

export interface PayrollSummary {
  employeeId: string
  name: string
  month: string
  baseSalary: string
  monthSales: string
  bonus: string
  fines: string
  advances: string
  finalSalary: string
}

export interface PayrollResult {
  month: string
  totalSales: string
  employees: Array<{
    employeeId: string
    name: string
    baseSalary: string
    bonus: string
    fines: string
    advances: string
    finalSalary: string
    applied: boolean
  }>
}

export interface PayrollCalculateDto {
  month: string
  applyImmediately?: boolean
}
