import api from './axios'
import type {
  Employee,
  EmployeePayment,
  EmployeeFine,
  EmployeeShift,
  PayEmployeeDto,
  CreateFineDto,
  CreateShiftDto,
  PayrollSummary,
  PayrollCalculateDto,
  PayrollResult,
} from '@/types/employee.types'

export const employeesApi = {
  list: (): Promise<Employee[]> =>
    api.get('/employees'),

  create: (dto: Partial<Employee> & { name: string; role: string }): Promise<Employee> =>
    api.post('/employees', dto),

  getById: (id: string): Promise<Employee> =>
    api.get(`/employees/${id}`),

  update: (id: string, dto: Partial<Employee>): Promise<Employee> =>
    api.patch(`/employees/${id}`, dto),

  delete: (id: string): Promise<void> =>
    api.delete(`/employees/${id}`),

  pay: (id: string, dto: PayEmployeeDto): Promise<EmployeePayment> =>
    api.post(`/employees/${id}/pay`, dto),

  getPayments: (id: string): Promise<EmployeePayment[]> =>
    api.get(`/employees/${id}/payments`),

  createFine: (id: string, dto: CreateFineDto): Promise<EmployeeFine> =>
    api.post(`/employees/${id}/fine`, dto),

  getFines: (id: string): Promise<EmployeeFine[]> =>
    api.get(`/employees/${id}/fines`),

  createShift: (id: string, dto: CreateShiftDto): Promise<EmployeeShift> =>
    api.post(`/employees/${id}/shifts`, dto),

  getShifts: (id: string): Promise<EmployeeShift[]> =>
    api.get(`/employees/${id}/shifts`),

  getPayroll: (id: string, month: string): Promise<PayrollSummary> =>
    api.get(`/employees/${id}/payroll/${month}`),

  calculatePayroll: (dto: PayrollCalculateDto): Promise<PayrollResult> =>
    api.post('/employees/payroll/calculate-month', dto),
}
