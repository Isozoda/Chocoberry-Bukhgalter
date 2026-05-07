import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SupplierBreakdown } from '@/types/supplier.types'

interface SupplierBreakdownChartProps {
  data: SupplierBreakdown[]
}

export function SupplierBreakdownChart({ data }: SupplierBreakdownChartProps) {
  const chartData = data.map((d) => ({
    name: d.supplierName,
    total: parseFloat(d.total),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${v} см`, 'Total']} />
        <Bar dataKey="total" fill="#E8593C" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
