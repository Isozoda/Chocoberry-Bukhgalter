import { apiClient } from './axios'
import type { ProfitReport, CashflowReport, MonthlyReport, TopProduct, HotHour } from '@/types/report.types'

export const reportsApi = {
  profit: (params?: Record<string, unknown>): Promise<ProfitReport[]> =>
    apiClient.get('/reports/profit', { params }),

  cashflow: (params?: Record<string, unknown>): Promise<CashflowReport[]> =>
    apiClient.get('/reports/cashflow', { params }),

  cogs: (params?: Record<string, unknown>): Promise<unknown> =>
    apiClient.get('/reports/cogs', { params }),

  monthly: (params?: Record<string, unknown>): Promise<MonthlyReport> =>
    apiClient.get('/reports/monthly', { params }),

  topProducts: (params?: Record<string, unknown>): Promise<TopProduct[]> =>
    apiClient.get('/reports/top-products', { params }),

  supplierBreakdown: (params?: Record<string, unknown>): Promise<unknown> =>
    apiClient.get('/reports/supplier-breakdown', { params }),

  hotHours: (params?: Record<string, unknown>): Promise<HotHour[]> =>
    apiClient.get('/reports/hot-hours', { params }),

  payroll: (month: string): Promise<unknown[]> =>
    apiClient.get(`/reports/payroll/${month}`),

  exportExcel: (params?: Record<string, unknown>): Promise<Blob> =>
    apiClient.get('/reports/export/excel', { params, responseType: 'blob' }),

  exportPdf: (params?: Record<string, unknown>): Promise<Blob> =>
    apiClient.get('/reports/export/pdf', { params, responseType: 'blob' }),
}
