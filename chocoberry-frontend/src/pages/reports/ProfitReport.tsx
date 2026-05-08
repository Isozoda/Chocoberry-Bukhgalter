import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatsCard } from '@/components/ui/StatsCard'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'

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
          <StatsCard label={t('totalRevenue')} value={data.totalIncome} isMoney />
          <StatsCard label={t('totalExpenses')} value={data.totalExpenses} isMoney />
          <StatsCard label={t('netProfit')} value={data.netProfit} isMoney />
        </div>
      )}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">{t('profitMargin')}</p>
              <p className="text-2xl font-bold text-primary">{data.profitMargin}%</p>
            </CardContent>
          </Card>

          {data.expenseBreakdown?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('expenseBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.expenseBreakdown.map((e) => (
                    <div key={e.expenseType} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{e.expenseType.toLowerCase().replace(/_/g, ' ')}</span>
                      <MoneyDisplay amount={e._sum.amount || '0'} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
