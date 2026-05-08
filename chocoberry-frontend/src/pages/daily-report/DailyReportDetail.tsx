import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { dailyReportApi } from '@/api/daily-report.api'
import { formatDate } from '@/utils/date.util'
import toast from 'react-hot-toast'

export default function DailyReportDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('dailyReport')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: report, isLoading } = useQuery({
    queryKey: ['daily-report', id],
    queryFn: () => dailyReportApi.getById(id!),
    enabled: !!id,
  })

  const finalizeMutation = useMutation({
    mutationFn: () => dailyReportApi.finalize(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-report', id] })
      toast.success(t('finalized'))
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!report) return null

  const Row = ({ label, value, className }: { label: string; value: string; className?: string }) => (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <MoneyDisplay amount={value} className={className} />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/daily-report')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{t('reportFor')} {formatDate(report.date)}</h1>
          <p className="text-sm text-muted-foreground">#{report.id.slice(-8).toUpperCase()}</p>
        </div>
        <Badge variant={report.isFinalized ? 'success' : 'secondary'}>
          {t(report.isFinalized ? 'status.FINALIZED' : 'status.DRAFT')}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">{t('income')}</h3>
          <Row label={t('totalSales')} value={report.totalSales} />
          {parseFloat(report.extraIncome) > 0 && (
            <Row label={t('extraIncome')} value={report.extraIncome} />
          )}
          <Row label={t('totalIncome')} value={report.totalIncome} className="font-bold text-green-600" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">{t('expenses')}</h3>
          {parseFloat(report.operationalExp) > 0 && (
            <Row label={t('operationalExpenses')} value={report.operationalExp} />
          )}
          {parseFloat(report.consumablesExp) > 0 && (
            <Row label={t('consumables')} value={report.consumablesExp} />
          )}
          {report.draws?.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('ownerDraws')}</p>
              {report.draws.map((d, i) => (
                <div key={i} className="flex justify-between items-center py-1 pl-4 text-sm">
                  <span className="text-muted-foreground">↳ {d.ownerName}</span>
                  <MoneyDisplay amount={d.amount} />
                </div>
              ))}
            </div>
          )}
          {report.suppliers?.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('supplierPayments')}</p>
              {report.suppliers.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1 pl-4 text-sm">
                  <span className="text-muted-foreground">↳ {s.name}</span>
                  <MoneyDisplay amount={s.amount} />
                </div>
              ))}
            </div>
          )}
          <Separator className="my-2" />
          <Row label={t('totalExpenses')} value={report.totalExpenses} className="text-red-600 font-bold" />
        </CardContent>
      </Card>

      <Card className="border-primary/50">
        <CardContent className="pt-6 space-y-1">
          {parseFloat(report.charityAmount) > 0 && (
            <Row label={t('charity')} value={report.charityAmount} className="text-orange-600" />
          )}
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-lg">{t('remainingCash')}</span>
            <MoneyDisplay
              amount={report.remaining}
              className={`font-bold text-lg ${parseFloat(report.remaining) >= 0 ? 'text-green-600' : 'text-red-600'}`}
            />
          </div>
        </CardContent>
      </Card>

      {report.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">{t('notes')}</p>
            <p className="text-sm">{report.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          {t('common:actions.print')}
        </Button>
        {!report.isFinalized && (
          <Button
            className="flex-1"
            onClick={() => finalizeMutation.mutate()}
            disabled={finalizeMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('finalize')}
          </Button>
        )}
      </div>
    </div>
  )
}
