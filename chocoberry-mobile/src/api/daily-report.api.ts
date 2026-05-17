import { apiClient } from './axios'
import type { DailyReport, CreateDailyReportDto } from '@/types/daily-report.types'
import type { PaginatedResponse } from '@/types/api.types'

export const dailyReportApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<DailyReport>> =>
    apiClient.get('/daily-report', { params }),

  create: (dto: CreateDailyReportDto): Promise<DailyReport> =>
    apiClient.post('/daily-report', dto),

  today: (): Promise<DailyReport | null> =>
    apiClient.get('/daily-report/today'),

  getById: (id: string): Promise<DailyReport> =>
    apiClient.get(`/daily-report/${id}`),

  update: (id: string, dto: Partial<CreateDailyReportDto>): Promise<DailyReport> =>
    apiClient.patch(`/daily-report/${id}`, dto),

  summary: (id: string): Promise<unknown> =>
    apiClient.get(`/daily-report/${id}/summary`),

  finalize: (id: string): Promise<DailyReport> =>
    apiClient.post(`/daily-report/${id}/finalize`),
}
