import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/utils/decimal.util'

interface BreakdownItem {
  type: string
  total: string
  count: number
}

interface Props {
  data: BreakdownItem[]
}

const COLORS = ['#E8593C', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

export default function ExpenseBreakdown({ data }: Props) {
  const { t } = useTranslation('expenses')

  const chartData = data.map((item, i) => ({
    name: t(`types.${item.type}`),
    value: parseFloat(item.total),
    color: COLORS[i % COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('breakdownByType')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={((v: unknown) => formatMoney(String(v ?? 0))) as any} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
