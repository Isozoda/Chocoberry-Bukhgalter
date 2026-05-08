import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import { formatMoney } from '@/utils/decimal.util'

export default function HotHoursReport() {
  const { t } = useTranslation('reports')
  const now = new Date()
  const [from, setFrom] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  )
  const [to, setTo] = useState(now.toISOString().split('T')[0])

  const { data } = useQuery({
    queryKey: ['hot-hours-report', from, to],
    queryFn: () => reportsApi.hotHours({ from, to }),
  })

  const hours = data ?? []
  const maxCount = Math.max(...hours.map((h) => h.count), 1)
  const peakHour = hours.reduce((best, h) => (h.count > best.count ? h : best), { hour: 0, count: 0, revenue: '0' })

  const chartData = hours.map((h) => ({
    hour: `${h.hour}:00`,
    [t('sales')]: h.count,
    [t('revenue')]: parseFloat(h.revenue),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-end">
          <div>
            <Label className="text-sm">{t('startDate')}</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-40" />
          </div>
          <div>
            <Label className="text-sm">{t('endDate')}</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-40" />
          </div>
        </div>
        <ExportButtons reportType="hot-hours" params={{ from, to }} />
      </div>

      {hours.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('peakHour')}: <strong>{peakHour.hour}:00</strong> — {peakHour.count} {t('sales')}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('salesHeatmap')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={1} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={((v: unknown, name: string) => {
                  if (name === t('revenue')) return formatMoney(String(v ?? 0))
                  return [v, name]
                }) as any} />
                <Bar dataKey={t('sales')} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => {
                    const ratio = hours[i]?.count / maxCount
                    const opacity = 0.3 + ratio * 0.7
                    return <Cell key={i} fill={`rgba(232, 89, 60, ${opacity})`} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
