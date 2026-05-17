import { apiClient } from './axios'
import type { Cashbox, CashboxMovement, CashboxDto } from '@/types/cashbox.types'

export const cashboxApi = {
  get: (): Promise<Cashbox> =>
    apiClient.get('/cashbox'),

  cashIn: (dto: CashboxDto): Promise<Cashbox> =>
    apiClient.post('/cashbox/in', dto),

  cashOut: (dto: CashboxDto): Promise<Cashbox> =>
    apiClient.post('/cashbox/out', dto),

  open: (): Promise<Cashbox> =>
    apiClient.post('/cashbox/open'),

  close: (): Promise<Cashbox> =>
    apiClient.post('/cashbox/close'),

  history: (): Promise<CashboxMovement[]> =>
    apiClient.get('/cashbox/history'),

  todayReport: (): Promise<unknown> =>
    apiClient.get('/cashbox/report/today'),
}
