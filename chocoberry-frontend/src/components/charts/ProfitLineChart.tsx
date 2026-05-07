import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatDate } from '@/utils/date.util'

interface ProfitLineChartProps {
  data: Array<{ date: string; revenue: string; expenses: string; profit: string }>
}

export function ProfitLineChart({ data }: ProfitLineChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date, 'DD.MM'),
    revenue: parseFloat(d.revenue),
    expenses: parseFloat(d.expenses),
    profit: parseFloat(d.profit),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="expenses" stroke="#E8593C" name="Expenses" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="profit" stroke="#4A2810" name="Profit" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
