import dayjs from 'dayjs'
import 'dayjs/locale/ru'

export const formatDate = (date: string | Date, format = 'DD.MM.YYYY'): string =>
  dayjs(date).format(format)

export const formatDateTime = (date: string | Date): string =>
  dayjs(date).format('DD.MM.YYYY HH:mm')

export const formatTime = (date: string | Date): string =>
  dayjs(date).format('HH:mm')

export const startOfDay = (date?: string | Date): string =>
  dayjs(date).startOf('day').toISOString()

export const endOfDay = (date?: string | Date): string =>
  dayjs(date).endOf('day').toISOString()

export const startOfMonth = (date?: string | Date): string =>
  dayjs(date).startOf('month').toISOString()

export const endOfMonth = (date?: string | Date): string =>
  dayjs(date).endOf('month').toISOString()

export const todayISO = (): string => dayjs().format('YYYY-MM-DD')

export const monthKey = (date?: string | Date): string =>
  dayjs(date).format('YYYY-MM')
