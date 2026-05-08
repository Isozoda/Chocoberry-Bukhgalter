import api from './axios'
import type {
  ProfitReport,
  CashflowReport,
  COGSReport,
  MonthlyReport,
  TopProductsReport,
  HotHoursReport,
  SupplierBreakdownReport,
  PayrollReport,
  DateRangeParams,
} from '@/types/report.types'

export const reportsApi = {
  profit: (params: Partial<DateRangeParams>): Promise<ProfitReport> =>
    api.get('/reports/profit', { params }),

  cashflow: (params: Partial<DateRangeParams>): Promise<CashflowReport> =>
    api.get('/reports/cashflow', { params }),

  cogs: (params: Partial<DateRangeParams>): Promise<COGSReport> =>
    api.get('/reports/cogs', { params }),

  daily: (params: Partial<DateRangeParams>): Promise<{ date: string; salesCount: number; totalSales: string; totalExpenses: string; netProfit: string }> =>
    api.get('/reports/daily-summary', { params }),

  monthly: (params: { year?: number; month?: number }): Promise<MonthlyReport> =>
    api.get('/reports/monthly', { params }),

  topProducts: (params: Partial<DateRangeParams> & { limit?: number }): Promise<TopProductsReport> =>
    api.get('/reports/top-products', { params }),

  supplierBreakdown: (params: Partial<DateRangeParams>): Promise<SupplierBreakdownReport> =>
    api.get('/reports/supplier-breakdown', { params }),

  hotHours: (params: Partial<DateRangeParams>): Promise<HotHoursReport> =>
    api.get('/reports/hot-hours', { params }),

  payroll: (month: string): Promise<PayrollReport> =>
    api.get(`/reports/payroll/${month}`),

  exportExcel: (params: Record<string, string>): Promise<Blob> =>
    api.get('/reports/export/excel', { params, responseType: 'blob' }),

  exportPdf: (params: Record<string, string>): Promise<Blob> =>
    api.get('/reports/export/pdf', { params, responseType: 'blob' }),
}
