import api from './axios'
import type { Business, CreateBusinessDto, BusinessDashboard, SetupResponse } from '../types/business.types'

export const businessApi = {
  create: (dto: CreateBusinessDto): Promise<Business> => api.post('/business', dto),
  get: (): Promise<Business> => api.get('/business'),
  update: (dto: Partial<CreateBusinessDto>): Promise<Business> => api.patch('/business', dto),
  dashboard: (): Promise<BusinessDashboard> => api.get('/business/dashboard'),
  setup: (dto: CreateBusinessDto): Promise<SetupResponse> => api.post('/business/setup', dto),
}
