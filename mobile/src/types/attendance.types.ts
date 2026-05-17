export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'DAY_OFF' | 'SICK'

export interface AttendanceRecord {
  id: string; status: AttendanceStatus; note: string | null
  bonus: string; penalty: string; overtimePay: string
}

export interface EmployeeWithAttendance {
  employee: { id: string; name: string; role: string; salary: string; salaryType: string }
  record: AttendanceRecord | null
}

export interface DailyAttendanceResponse {
  date: string; employees: EmployeeWithAttendance[]; present: number; absent: number; total: number
}

export interface MonthlyEmployeeSummary {
  employeeId: string; name: string; role: string; monthlySalary: string; dailyRate: string
  workedDays: number; absentDays: number; halfDays: number; lateDays: number
  sickDays: number; dayOffDays: number; totalBonus: string; totalPenalty: string
  totalOvertimePay: string; finalSalary: string
}

export interface MonthlyAttendanceResponse {
  month: string; workingDaysInMonth: number; totalPayroll: string
  totalBonuses: string; totalPenalties: string; employees: MonthlyEmployeeSummary[]
}

export interface UpsertAttendanceDto {
  date: string; status: AttendanceStatus; note?: string
  bonus?: number; penalty?: number; overtimePay?: number
}
