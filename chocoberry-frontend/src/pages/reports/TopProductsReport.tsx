import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import { formatMoney } from '@/utils/decimal.util'
import type { ColumnDef } from '@/components/ui/DataTable'

const COLORS = ['#E8593C', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

export default function TopProductsReport() {
  const { t } = useTranslation('reports')
  const now = new Date()
  const [from, setFrom] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  )
  const [to, setTo] = useState(now.toISOString().split('T')[0])

  const { data } = useQuery({
    queryKey: ['top-products-report', from, to],
    queryFn: () => reportsApi.topProducts({ from, to }),
  })

  const chartData = data?.products?.slice(0, 7).map((p, i) => ({
    name: p.nameRu || p.nameTg,
    value: parseFloat(p.revenue),
    color: COLORS[i % COLORS.length],
  })) ?? []

  const columns: ColumnDef<typeof data extends undefined ? never : NonNullable<typeof data>['products'][number]>[] = [
    {
      key: 'rank',
      header: '#',
      cell: (row) => <span className="font-mono text-sm">#{row.rank}</span>,
    },
    {
      key: 'nameRu',
      header: t('product'),
      cell: (row) => <span className="font-medium">{row.nameRu || row.nameTg}</span>,
    },
    {
      key: 'qtySold',
      header: t('quantity'),
      cell: (row) => <span>{row.qtySold}</span>,
    },
    {
      key: 'revenue',
      header: t('revenue'),
      cell: (row) => <MoneyDisplay amount={row.revenue} className="font-semibold" />,
    },
    {
      key: 'cost',
      header: t('cost'),
      cell: (row) => <MoneyDisplay amount={row.cost} />,
    },
    {
      key: 'margin',
      header: t('margin'),
      cell: (row) => (
        <span className={parseFloat(row.margin) > 0 ? 'text-green-600' : 'text-red-600'}>
          {parseFloat(row.margin).toFixed(1)}%
        </span>
      ),
    },
  ]

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
        <ExportButtons reportType="top-products" params={{ from, to }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('revenueByProduct')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={2}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={((v: unknown) => formatMoney(String(v ?? 0))) as any} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <DataTable
          columns={columns as ColumnDef<Record<string, unknown>>[]}
          data={(data?.products ?? []) as Record<string, unknown>[]}
          emptyMessage={t('noData')}
        />
      </div>
    </div>
  )
}

