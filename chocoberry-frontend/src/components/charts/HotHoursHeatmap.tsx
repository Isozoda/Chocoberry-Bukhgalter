import { cn } from '@/lib/utils'
import type { HotHour } from '@/types/sale.types'

interface HotHoursHeatmapProps {
  data: HotHour[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function HotHoursHeatmap({ data }: HotHoursHeatmapProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const getCount = (hour: number, _day: number) => {
    return data.find((d) => d.hour === hour)?.count || 0
  }

  const getIntensity = (count: number) => {
    const ratio = count / maxCount
    if (ratio === 0) return 'bg-muted'
    if (ratio < 0.25) return 'bg-brand-100'
    if (ratio < 0.5) return 'bg-brand-300'
    if (ratio < 0.75) return 'bg-brand-500'
    return 'bg-brand-700'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-1 mb-1 ml-8">
          {HOURS.map((h) => (
            <div key={h} className="w-6 text-center text-xs text-muted-foreground">
              {h}
            </div>
          ))}
        </div>
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <div className="w-7 text-xs text-muted-foreground text-right">{day}</div>
            {HOURS.map((hour) => {
              const count = getCount(hour, dayIndex)
              return (
                <div
                  key={hour}
                  className={cn('w-6 h-5 rounded-sm transition-colors', getIntensity(count))}
                  title={`${day} ${hour}:00 — ${count} sales`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
