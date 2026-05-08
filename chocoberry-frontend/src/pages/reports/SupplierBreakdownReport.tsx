import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import { formatMoney } from '@/utils/decimal.util'
import type { SupplierBreakdownItem } from '@/types/report.types'
import type { ColumnDef } from '@/components/ui/DataTable'

const COLORS = ['#E8593C', '#f97316', '#eab308', '#22c55e', '#3b82f6']

export default function SupplierBreakdownReport() {
  const { t } = useTranslation('reports')
  const now = new Date()
  const [from, setFrom] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  )
  const [to, setTo] = useState(now.toISOString().split('T')[0])

  const { data } = useQuery({
    queryKey: ['supplier-breakdown-report', from, to],
    queryFn: () => reportsApi.supplierBreakdown({ from, to }),
  })

  const suppliers = data ?? []

  const chartData = suppliers.slice(0, 8).map((s, i) => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
    amount: parseFloat(s.total),
    color: COLORS[i % COLORS.length],
  }))

  const columns: ColumnDef<SupplierBreakdownItem>[] = [
    { key: 'name', header: t('supplier'), cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'purchaseCount', header: t('purchases'), cell: (row) => <span>{row.purchaseCount}</span> },
    {
      key: 'total',
      header: t('totalAmount'),
      cell: (row) => <MoneyDisplay amount={row.total} className="font-semibold" />,
    },
    {
      key: 'percentage',
      header: '%',
      cell: (row) => <span className="text-sm">{parseFloat(row.percentage).toFixed(1)}%</span>,
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
        <ExportButtons reportType="supplier-breakdown" params={{ from, to }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('spendBySupplier')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={(v) => formatMoney(v.toString()).replace(' см', '')} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={((v: unknown) => formatMoney(String(v ?? 0))) as any} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns as unknown as ColumnDef<Record<string, unknown>>[]}
        data={suppliers as unknown as Record<string, unknown>[]}
        emptyMessage={t('noData')}
      />
    </div>
  )
}
