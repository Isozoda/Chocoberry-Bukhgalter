import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format = 'DD.MM.YYYY'): string =>
  dayjs(date).format(format)

export const formatDateTime = (date: string | Date): string =>
  dayjs(date).format('DD.MM.YYYY HH:mm')

export const startOfDay = (date: string | Date): string =>
  dayjs(date).startOf('day').toISOString()

export const endOfDay = (date: string | Date): string =>
  dayjs(date).endOf('day').toISOString()

export const getMonthRange = (year: number, month: number): { from: string; to: string } => ({
  from: dayjs().year(year).month(month - 1).startOf('month').format('YYYY-MM-DD'),
  to: dayjs().year(year).month(month - 1).endOf('month').format('YYYY-MM-DD'),
})

export const today = (): string => dayjs().format('YYYY-MM-DD')
export const thisMonth = (): string => dayjs().format('YYYY-MM')

export const last7Days = (): { from: string; to: string } => ({
  from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
  to: dayjs().format('YYYY-MM-DD'),
})

export const last30Days = (): { from: string; to: string } => ({
  from: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
  to: dayjs().format('YYYY-MM-DD'),
})

export const parseMonth = (monthStr: string): { year: number; month: number } => {
  const [year, month] = monthStr.split('-').map(Number)
  return { year, month }
}
