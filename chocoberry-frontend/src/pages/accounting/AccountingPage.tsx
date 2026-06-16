import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, Users, Receipt, TrendingUp, ArrowRight, Banknote, CreditCard, Clock,
} from 'lucide-react'
import { cashboxApi } from '@/api/cashbox.api'
import { reportsApi } from '@/api/reports.api'
import { expensesApi } from '@/api/expenses.api'
import { fixedExpensesApi } from '@/api/fixed-expenses.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import ExpenseBreakdown from '@/pages/expenses/ExpenseBreakdown'
import { thisMonth, getMonthRange } from '@/utils/date.util'

// One shared view tying together Cashbox, Payroll, Expenses and the monthly P&L
// summary — cross-links to each full page rather than duplicating their logic.
export default function AccountingPage() {
  const { t } = useTranslation('accounting')
  const navigate = useNavigate()
  const month = thisMonth()
  const { from, to } = getMonthRange(...(month.split('-').map(Number) as [number, number]))

  const { data: balance, isLoading: loadingBalance } = useQuery({
    queryKey: ['cashbox-balance'],
    queryFn: cashboxApi.getBalance,
  })

  const { data: profit, isLoading: loadingProfit } = useQuery({
    queryKey: ['reports', 'profit', from, to],
    queryFn: () => reportsApi.profit({ from, to }),
  })

  const { data: payroll, isLoading: loadingPayroll } = useQuery({
    queryKey: ['reports', 'payroll', month],
    queryFn: () => reportsApi.payroll(month),
  })

  const { data: expenseBreakdown, isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses', 'breakdown', from, to],
    queryFn: () => expensesApi.getBreakdown({ from, to }),
  })

  const { data: fixedSummary } = useQuery({
    queryKey: ['fixed-expenses', 'summary', month],
    queryFn: () => fixedExpensesApi.summary(month),
  })

  const topEmployees = [...(payroll?.employees ?? [])]
    .sort((a, b) => parseFloat(b.final) - parseFloat(a.final))
    .slice(0, 5)

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title={t('title')} description={t('description')} icon={Wallet} />

      {/* Top-level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={t('totalBalance')}
          value={balance?.totalBalance ?? '0'}
          icon={Banknote}
          iconColor="text-emerald-500"
          isLoading={loadingBalance}
        />
        <StatsCard
          label={t('totalPaidThisMonth')}
          value={payroll?.totalPayroll ?? '0'}
          icon={Users}
          iconColor="text-blue-500"
          isLoading={loadingPayroll}
        />
        <StatsCard
          label={t('expenses')}
          value={profit?.totalExpenses ?? '0'}
          icon={Receipt}
          iconColor="text-red-500"
          isLoading={loadingProfit}
        />
        <StatsCard
          label={t('netProfit')}
          value={profit?.netProfit ?? '0'}
          icon={TrendingUp}
          iconColor="text-orange-500"
          isLoading={loadingProfit}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Cashbox */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-500" />
              {t('cashbox')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingBalance ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="h-3.5 w-3.5" /> {t('cashBalance')}
                  </span>
                  <MoneyDisplay amount={balance?.cashBalance ?? '0'} className="font-semibold" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> {t('dcBalance')}
                  </span>
                  <MoneyDisplay amount={balance?.dcBalance ?? '0'} className="font-semibold" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> {t('alifBalance')}
                  </span>
                  <MoneyDisplay amount={balance?.alifBalance ?? '0'} className="font-semibold" />
                </div>
              </>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/app/cashbox')}>
              {t('viewCashbox')} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Payroll */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              {t('topEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {loadingPayroll ? (
              <Skeleton className="h-16 w-full" />
            ) : topEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">{t('noData')}</p>
            ) : (
              topEmployees.map((e) => (
                <div key={e.employeeId} className="flex items-center justify-between text-sm">
                  <span className="truncate text-foreground">{e.name}</span>
                  <MoneyDisplay amount={e.final} className="font-semibold shrink-0 ml-2" />
                </div>
              ))
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/app/employees')}>
              {t('viewPayroll')} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-red-500" />
              {t('expenses')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {loadingExpenses ? (
              <Skeleton className="h-16 w-full" />
            ) : !expenseBreakdown || expenseBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">{t('noData')}</p>
            ) : (
              expenseBreakdown.slice(0, 5).map((row) => (
                <div key={row.type} className="flex items-center justify-between text-sm">
                  <span className="truncate text-muted-foreground">{row.type}</span>
                  <MoneyDisplay amount={row.total} className="font-semibold shrink-0 ml-2" />
                </div>
              ))
            )}
            {fixedSummary && parseFloat(fixedSummary.totalPending) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-orange-500 pt-1">
                <Clock className="h-3.5 w-3.5" />
                {t('pendingFixed')}: <MoneyDisplay amount={fixedSummary.totalPending} className="font-semibold" />
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/app/expenses')}>
              {t('viewExpenses')} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Expense breakdown chart + link to full P&L */}
      <div className="grid gap-4 lg:grid-cols-3">
        {expenseBreakdown && expenseBreakdown.length > 0 && (
          <div className="lg:col-span-2">
            <ExpenseBreakdown data={expenseBreakdown.map((r) => ({ type: r.type, total: r.total, count: r.count }))} />
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('income')} vs {t('expenses')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingProfit ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('income')}</span>
                  <MoneyDisplay amount={profit?.totalIncome ?? '0'} className="font-semibold text-emerald-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('expenses')}</span>
                  <MoneyDisplay amount={profit?.totalExpenses ?? '0'} className="font-semibold text-red-500" />
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                  <span className="text-foreground font-medium">{t('netProfit')}</span>
                  <MoneyDisplay amount={profit?.netProfit ?? '0'} className="font-bold text-orange-500" />
                </div>
              </>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/app/reports')}>
              {t('viewReports')} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
