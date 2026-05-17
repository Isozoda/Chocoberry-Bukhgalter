import api from './axios'

export interface DateRangeParams { from: string; to: string }

export const reportsApi = {
  profit: (params: Partial<DateRangeParams>) => api.get('/reports/profit', { params }),
  cashflow: (params: Partial<DateRangeParams>) => api.get('/reports/cashflow', { params }),
  cogs: (params: Partial<DateRangeParams>) => api.get('/reports/cogs', { params }),
  monthly: (params: { year?: number; month?: number }) => api.get('/reports/monthly', { params }),
  topProducts: (params: Partial<DateRangeParams> & { limit?: number }) =>
    api.get('/reports/top-products', { params }),
  hotHours: (params: Partial<DateRangeParams>) => api.get('/reports/hot-hours', { params }),
  payroll: (month: string) => api.get(`/reports/payroll/${month}`),
}
