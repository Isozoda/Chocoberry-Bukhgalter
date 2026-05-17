import { apiClient } from './axios'
import type { Employee, CreateEmployeeDto, EmployeePayment, EmployeeFine, PayrollResult } from '@/types/employee.types'

export const employeesApi = {
  list: (): Promise<Employee[]> =>
    apiClient.get('/employees'),

  create: (dto: CreateEmployeeDto): Promise<Employee> =>
    apiClient.post('/employees', dto),

  getById: (id: string): Promise<Employee> =>
    apiClient.get(`/employees/${id}`),

  update: (id: string, dto: Partial<CreateEmployeeDto>): Promise<Employee> =>
    apiClient.patch(`/employees/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/employees/${id}`),

  pay: (id: string, dto: { type: string; amount: string; period?: string; notes?: string }): Promise<EmployeePayment> =>
    apiClient.post(`/employees/${id}/pay`, dto),

  getPayments: (id: string): Promise<EmployeePayment[]> =>
    apiClient.get(`/employees/${id}/payments`),

  createFine: (id: string, dto: { amount: string; reason: string; date: string }): Promise<EmployeeFine> =>
    apiClient.post(`/employees/${id}/fine`, dto),

  getFines: (id: string): Promise<EmployeeFine[]> =>
    apiClient.get(`/employees/${id}/fines`),

  createShift: (id: string, dto: { startTime: string; endTime: string }): Promise<unknown> =>
    apiClient.post(`/employees/${id}/shifts`, dto),

  getPayroll: (id: string, month: string): Promise<PayrollResult> =>
    apiClient.get(`/employees/${id}/payroll/${month}`),

  calculatePayroll: (dto: { month: string; applyNow?: boolean }): Promise<PayrollResult[]> =>
    apiClient.post('/employees/payroll/calculate-month', dto),
}
