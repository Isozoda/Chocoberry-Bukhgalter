import api from './axios'
import type {
  DailyReport,
  CreateDailyReportDto,
  DailyReportSummary,
} from '@/types/daily-report.types'
import type { PaginatedResponse } from '@/types/api.types'

export const dailyReportApi = {
  list: (params?: { from?: string; to?: string; page?: number; limit?: number }): Promise<PaginatedResponse<DailyReport>> =>
    api.get('/daily-report', { params }),

  create: (dto: CreateDailyReportDto): Promise<DailyReport> =>
    api.post('/daily-report', dto),

  today: (): Promise<DailyReport | null> =>
    api.get('/daily-report/today'),

  getById: (id: string): Promise<DailyReport> =>
    api.get(`/daily-report/${id}`),

  update: (id: string, dto: Partial<CreateDailyReportDto>): Promise<DailyReport> =>
    api.patch(`/daily-report/${id}`, dto),

  summary: (id: string): Promise<DailyReportSummary> =>
    api.get(`/daily-report/${id}/summary`),

  finalize: (id: string): Promise<DailyReport> =>
    api.post(`/daily-report/${id}/finalize`),
}
