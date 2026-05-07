import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatsCard } from '@/components/ui/StatsCard'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import { formatMoney } from '@/utils/decimal.util'

export default function ProfitReport() {
  const { t } = useTranslation('reports')
  const now = new Date()
  const [from, setFrom] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  )
  const [to, setTo] = useState(now.toISOString().split('T')[0])

  const { data } = useQuery({
    queryKey: ['profit-report', from, to],
    queryFn: () => reportsApi.profit({ from, to }),
  })

  const chartData = data?.daily?.map((d) => ({
    date: d.date,
    [t('revenue')]: parseFloat(d.revenue),
    [t('expenses')]: parseFloat(d.expenses),
    [t('profit')]: parseFloat(d.profit),
  })) ?? []

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
        <ExportButtons reportType="profit" params={{ from, to }} />
      </div>

      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard label={t('totalRevenue')} value={data.totalRevenue} isMoney />
          <StatsCard label={t('totalExpenses')} value={data.totalExpenses} isMoney />
          <StatsCard label={t('netProfit')} value={data.netProfit} isMoney />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('profitTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatMoney(v.toString()).replace(' СЃРј', '')} tick={{ fontSize: 12 }} />
                <Tooltip formatter={((v: unknown) => formatMoney(String(v ?? 0))) as any} />
                <Legend />
                <Line type="monotone" dataKey={t('revenue')} stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={t('expenses')} stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={t('profit')} stroke="#E8593C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

