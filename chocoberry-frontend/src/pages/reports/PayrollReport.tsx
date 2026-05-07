import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { StatsCard } from '@/components/ui/StatsCard'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import type { ColumnDef } from '@/components/ui/DataTable'

export default function PayrollReport() {
  const { t } = useTranslation('reports')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const { data } = useQuery({
    queryKey: ['payroll-report', monthStr],
    queryFn: () => reportsApi.payroll(monthStr),
  })

  type EmployeeRow = NonNullable<typeof data>['employees'][number]

  const columns: ColumnDef<EmployeeRow>[] = [
    {
      key: 'name',
      header: t('employee'),
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: 'baseSalary', header: t('salary'), cell: (row) => <MoneyDisplay amount={row.baseSalary} /> },
    { key: 'bonus', header: t('bonus'), cell: (row) => <MoneyDisplay amount={row.bonus} className="text-green-600" /> },
    { key: 'advances', header: t('advances'), cell: (row) => <MoneyDisplay amount={row.advances} className="text-orange-600" /> },
    { key: 'fines', header: t('fines'), cell: (row) => <MoneyDisplay amount={row.fines} className="text-red-600" /> },
    { key: 'final', header: t('netPay'), cell: (row) => <MoneyDisplay amount={row.final} className="font-bold text-primary" /> },
  ]

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
        <ExportButtons reportType="payroll" params={{ month: monthStr }} />
      </div>

      {data && (
        <StatsCard label={t('totalPayroll')} value={data.totalPayroll} isMoney />
      )}

      <DataTable
        columns={columns as ColumnDef<Record<string, unknown>>[]}
        data={(data?.employees ?? []) as Record<string, unknown>[]}
        emptyMessage={t('noData')}
      />
    </div>
  )
}
