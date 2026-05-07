import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarIcon } from 'lucide-react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Input } from './input'
import { Label } from './label'
import { formatDate } from '@/utils/date.util'

export interface DateRangePickerProps {
  from?: string
  to?: string
  onFromChange?: (date: string) => void
  onToChange?: (date: string) => void
  value?: { from: Date; to: Date } | undefined
  onChange?: (range: { from: Date; to: Date } | undefined) => void
}

export function DateRangePicker({
  from: fromProp,
  to: toProp,
  onFromChange,
  onToChange,
  value,
  onChange,
}: DateRangePickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const from = fromProp ?? value?.from?.toISOString().split('T')[0] ?? ''
  const to = toProp ?? value?.to?.toISOString().split('T')[0] ?? ''

  const handleFromChange = (date: string) => {
    if (onFromChange) onFromChange(date)
    if (onChange) {
      onChange(date ? { from: new Date(date), to: value?.to ?? new Date(to) } : undefined)
    }
  }

  const handleToChange = (date: string) => {
    if (onToChange) onToChange(date)
    if (onChange) {
      onChange(date ? { from: value?.from ?? new Date(from), to: new Date(date) } : undefined)
    }
  }

  const label = from && to
    ? `${formatDate(from)} – ${formatDate(to)}`
    : t('labels.filter')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">{t('labels.from')}</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => handleFromChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t('labels.to')}</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
          />
        </div>
        <Button size="sm" className="w-full" onClick={() => setOpen(false)}>
          {t('actions.confirm')}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
