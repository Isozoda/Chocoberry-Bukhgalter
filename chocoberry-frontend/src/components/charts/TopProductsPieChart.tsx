import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import type { TopProduct } from '@/types/sale.types'

const COLORS = ['#E8593C', '#4A2810', '#FFF5E6', '#6B7280', '#10B981']

interface TopProductsPieChartProps {
  data: TopProduct[]
}

export function TopProductsPieChart({ data }: TopProductsPieChartProps) {
  const { i18n } = useTranslation()

  const chartData = data.slice(0, 5).map((p) => ({
    name: p.name,
    value: p.qty,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
