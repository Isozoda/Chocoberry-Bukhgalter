import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatDate } from '@/utils/date.util'
import { toDecimal } from '@/utils/decimal.util'

interface SalesBarChartProps {
  data: Array<{ date: string; total: string; count: number }>
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary">{toDecimal(payload[0].value).toFixed(2)} см</p>
      </div>
    )
  }
  return null
}

export function SalesBarChart({ data }: SalesBarChartProps) {
  const { t } = useTranslation('dashboard')

  const chartData = data.map((d) => ({
    date: formatDate(d.date, 'DD.MM'),
    total: parseFloat(d.total),
    count: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" fill="#E8593C" radius={[4, 4, 0, 0]} name={t('todaySales')} />
      </BarChart>
    </ResponsiveContainer>
  )
}
