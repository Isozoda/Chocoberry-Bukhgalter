import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExportButtons } from './ExportButtons'
import { reportsApi } from '@/api/reports.api'
import { cn } from '@/lib/utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

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

  // Build 7x24 matrix from flat heatmap array [{hour, dayOfWeek, count}]
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  data?.heatmap?.forEach(({ hour, dayOfWeek, count }) => {
    const dayIdx = ((dayOfWeek - 1) + 7) % 7
    if (dayIdx >= 0 && dayIdx < 7 && hour >= 0 && hour < 24) {
      matrix[dayIdx][hour] = count
    }
  })
  const maxValue = Math.max(...matrix.flat(), 1)

  const getIntensity = (value: number) => {
    const ratio = value / maxValue
    if (ratio === 0) return 'bg-muted'
    if (ratio < 0.25) return 'bg-primary/20'
    if (ratio < 0.5) return 'bg-primary/40'
    if (ratio < 0.75) return 'bg-primary/70'
    return 'bg-primary'
  }

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

      {data?.peakHour !== undefined && (
        <p className="text-sm text-muted-foreground">
          {t('peakHour')}: <strong>{data.peakHour}:00</strong>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('salesHeatmap')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-max">
            <div className="flex gap-1 mb-1 ml-10">
              {HOURS.filter(h => h % 3 === 0).map(h => (
                <div key={h} className="text-xs text-center text-muted-foreground" style={{ width: '72px' }}>
                  {h}:00
                </div>
              ))}
            </div>
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <div className="w-10 text-xs text-muted-foreground text-right pr-1 shrink-0">{day}</div>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className={cn('h-7 w-7 rounded-sm cursor-default shrink-0', getIntensity(matrix[di][h]))}
                    title={`${day} ${h}:00 — ${matrix[di][h]}`}
                  />
                ))}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>{t('low')}</span>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <div key={v} className={cn('h-4 w-6 rounded shrink-0', getIntensity(Math.round(v * maxValue)))} />
              ))}
              <span>{t('high')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
