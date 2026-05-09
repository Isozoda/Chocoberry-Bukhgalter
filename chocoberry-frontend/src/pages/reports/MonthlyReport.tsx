import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatsCard } from '@/components/ui/StatsCard'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import { formatMoney } from '@/utils/decimal.util'

export default function MonthlyReport() {
  const { t } = useTranslation(['reports', 'expenses'])
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const { data } = useQuery({
    queryKey: ['monthly-report', year, month],
    queryFn: () => reportsApi.monthly({ year, month }),
  })

  const dailyChartData = (data?.dailySales ?? []).map((d) => ({
    date: new Date(d.date).getDate().toString(),
    [t('revenue')]: parseFloat(d._sum.total || '0'),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-end">
          <div>
            <Label className="text-sm">{t('year')}</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="mt-1 w-28"
            />
          </div>
          <div>
            <Label className="text-sm">{t('month')}</Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="mt-1 w-20"
            />
          </div>
        </div>
        <ExportButtons reportType="monthly" params={{ year: year.toString(), month: month.toString() }} />
      </div>

      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard label={t('monthRevenue')} value={data.totalIncome} isMoney />
          <StatsCard label={t('totalExpenses')} value={data.totalExpenses} isMoney />
          <StatsCard label={t('netProfit')} value={data.netProfit} isMoney />
        </div>
      )}

      {data?.expenseBreakdown && data.expenseBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('expenseBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.expenseBreakdown.map((e) => (
                <div key={e.expenseType} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t(`expenses:types.${e.expenseType.toUpperCase()}`)}</span>
                  <MoneyDisplay amount={e._sum.amount || '0'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {dailyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dailySales')} — {monthStr}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatMoney(v.toString()).replace(' см', '')} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={((v: unknown) => formatMoney(String(v ?? 0))) as any} />
                  <Bar dataKey={t('revenue')} fill="#E8593C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
