import api from './axios'

export const aiApi = {
  analyzeSales: (period: string, date?: string) => api.post('/ai/analyze/sales', { period, date }),
  forecastInventory: (daysAhead: number) => api.post('/ai/forecast/inventory', { daysAhead }),
  weeklyAdvice: () => api.post('/ai/advisor/weekly'),
  askAdvisor: (question: string) => api.post('/ai/advisor/ask', { question }),
  getHistory: () => api.get('/ai/history'),
}
