import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Plus, FileText, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PageHeader } from '@/components/ui/PageHeader'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { dailyReportApi } from '@/api/daily-report.api'
import { formatDate } from '@/utils/date.util'
import type { DailyReport } from '@/types/daily-report.types'
import type { ColumnDef } from '@/components/ui/DataTable'

export default function DailyReportPage() {
  const { t } = useTranslation('dailyReport')
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['daily-reports', page, dateRange],
    queryFn: () => dailyReportApi.list({
      page,
      limit: 20,
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
    }),
  })

  const columns: ColumnDef<DailyReport>[] = [
    {
      key: 'date',
      header: t('date'),
      cell: (row) => <span className="font-medium">{formatDate(row.date)}</span>,
    },
    {
      key: 'totalSales',
      header: t('totalSales'),
      cell: (row) => <MoneyDisplay amount={row.totalSales} className="text-green-600" />,
    },
    {
      key: 'totalExpenses',
      header: t('totalExpenses'),
      cell: (row) => <MoneyDisplay amount={row.totalExpenses} className="text-red-600" />,
    },
    {
      key: 'charityAmount',
      header: t('charity'),
      cell: (row) => <MoneyDisplay amount={row.charityAmount} className="text-orange-600" />,
    },
    {
      key: 'remaining',
      header: t('remainingCash'),
      cell: (row) => (
        <MoneyDisplay
          amount={row.remaining}
          className={parseFloat(row.remaining) >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}
        />
      ),
    },
    {
      key: 'isFinalized',
      header: t('status'),
      cell: (row) => (
        <Badge variant={row.isFinalized ? 'success' : 'secondary'}>
          {t(row.isFinalized ? 'status.FINALIZED' : 'status.DRAFT')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/daily-report/${row.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={FileText}
        action={
          <Button onClick={() => navigate('/daily-report/new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newReport')}
          </Button>
        }
      />

      <div className="flex items-center justify-end">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={{
          page,
          total: data?.total ?? 0,
          limit: 20,
          onPageChange: setPage,
        }}
        emptyMessage={t('noReports')}
      />
    </div>
  )
}
