import { apiClient } from './axios'
import type { Business, BusinessSetupDto, DashboardStats } from '@/types/business.types'

export const businessApi = {
  setup: (dto: BusinessSetupDto): Promise<Business> =>
    apiClient.post('/business/setup', dto),

  profile: (): Promise<Business> =>
    apiClient.get('/business/profile'),

  updateProfile: (dto: Partial<BusinessSetupDto>): Promise<Business> =>
    apiClient.patch('/business/profile', dto),

  dashboard: (): Promise<DashboardStats> =>
    apiClient.get('/business/dashboard'),
}
