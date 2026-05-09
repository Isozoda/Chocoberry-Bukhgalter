import api from './axios'
import type {
  SalesAnalysisResult,
  InventoryForecastResult,
  AdvisorResult,
  SalesPeriod,
  ForecastDays,
} from '@/types/ai.types'

export const aiApi = {
  analyzeSales: (period: SalesPeriod, date?: string): Promise<SalesAnalysisResult> =>
    api.post('/ai/analyze/sales', { period, date }),

  forecastInventory: (daysAhead: ForecastDays): Promise<InventoryForecastResult> =>
    api.post('/ai/forecast/inventory', { daysAhead }),

  weeklyAdvice: (): Promise<AdvisorResult> =>
    api.post('/ai/advisor/weekly'),

  askAdvisor: (question: string): Promise<AdvisorResult> =>
    api.post('/ai/advisor/ask', { question }),

  getHistory: (): Promise<any[]> =>
    api.get('/ai/history'),
}
