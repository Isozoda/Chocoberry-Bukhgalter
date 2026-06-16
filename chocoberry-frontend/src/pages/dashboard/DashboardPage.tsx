import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, ShoppingBag,
  AlertTriangle, ArrowRight, Package, BarChart3, ClipboardList, ShoppingCart,
} from 'lucide-react'
import { businessApi } from '@/api/business.api'
import { salesApi } from '@/api/sales.api'
import { inventoryApi } from '@/api/inventory.api'
import { cashboxApi } from '@/api/cashbox.api'
import { fixedExpensesApi } from '@/api/fixed-expenses.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SalesBarChart } from '@/components/charts/SalesBarChart'
import { TopProductsPieChart } from '@/components/charts/TopProductsPieChart'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import { last7Days } from '@/utils/date.util'
import { cn } from '@/lib/utils'
import { t } from 'i18next'
import i18n from '@/i18n'

function KpiCard({
  label,
  value,
  sub,
  change,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  change?: number
  icon: React.ElementType
  color: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  const isPositive = change === undefined || change >= 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 mt-1.5 text-xs font-medium',
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              )}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{change.toFixed(1)}% {t('vsYesterday')}
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3 ml-4', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const { from, to } = last7Days()

  const { data: todayStats, isLoading: loadingStats } = useQuery({
    queryKey: ['sales', 'stats-today'],
    queryFn: salesApi.statsToday,
    refetchInterval: 30000,
  })

  const { data: dashboard } = useQuery({
    queryKey: ['business', 'dashboard'],
    queryFn: businessApi.dashboard,
  })

  const { data: lowStock = [] } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  })

  const { data: cashbox, isLoading: loadingCash } = useQuery({
    queryKey: ['cashbox', 'balance'],
    queryFn: cashboxApi.getBalance,
  })

  const { data: topProducts = [] } = useQuery({
    queryKey: ['sales', 'top-products', { from, to }],
    queryFn: () => salesApi.topProducts({ from, to, limit: 5 }),
  })

  const currentMonth = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()

  const { data: fixedSummary } = useQuery({
    queryKey: ['fixed-expenses', 'summary', currentMonth],
    queryFn: () => fixedExpensesApi.summary(currentMonth),
  })

  const { data: latestTelegramReport } = useQuery({
    queryKey: ['telegram-daily-report', 'latest'],
    queryFn: async () => {
      try {
        const { default: api } = await import('@/api/axios')
        const res = await api.get('/telegram/daily-report/latest')
        return res as any
      } catch {
        return null
      }
    },
    retry: false,
    staleTime: 60000,
  })

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString(i18n.language === 'tj' ? 'tg-TJ' : i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label={t('todaySales')}
          value={<MoneyDisplay amount={todayStats?.totalSales || '0'} />}
          change={todayStats?.vsYesterday}
          icon={TrendingUp}
          color="bg-primary"
          isLoading={loadingStats}
        />
        <KpiCard
          label={t('cashSales')}
          value={<MoneyDisplay amount={todayStats?.cashSales || '0'} />}
          sub={t('transactionsCount', { count: todayStats?.saleCount ?? 0 })}
          icon={DollarSign}
          color="bg-emerald-500"
          isLoading={loadingStats}
        />
        <KpiCard
          label={t('dushanbeCitySales')}
          value={<MoneyDisplay amount={todayStats?.dushanbeCitySales || '0'} />}
          icon={CreditCard}
          color="bg-blue-500"
          isLoading={loadingStats}
        />
        <KpiCard
          label={t('alifSales')}
          value={<MoneyDisplay amount={todayStats?.alifSales || '0'} />}
          icon={CreditCard}
          color="bg-sky-500"
          isLoading={loadingStats}
        />
        <KpiCard
          label={t('saleCount')}
          value={todayStats?.saleCount ?? 0}
          icon={ShoppingBag}
          color="bg-violet-500"
          isLoading={loadingStats}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {t('lowStockAlerts')}
              </CardTitle>
              {lowStock.length > 0 && (
                <Badge variant="destructive" className="rounded-full">{lowStock.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <div className="text-center py-6">
                <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('allStockOk')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-destructive">
                        {item.currentStock} / {item.minStockLevel} {item.unit.toLowerCase()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => navigate(`/app/inventory/${item.id}`)}
                    >
                      {t('restock')}
                    </Button>
                  </div>
                ))}
                {lowStock.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('/app/inventory')}>
                    {t('viewAllAlerts', { count: lowStock.length })} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cashbox */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('cashboxBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCash ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">{t('cash')}</span>
                  </div>
                  <MoneyDisplay amount={cashbox?.cashBalance || '0'} className="font-semibold" />
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">{t('dc')}</span>
                  </div>
                  <MoneyDisplay amount={cashbox?.dcBalance || '0'} className="font-semibold" />
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <CreditCard className="h-3.5 w-3.5 text-sky-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">{t('alif')}</span>
                  </div>
                  <MoneyDisplay amount={cashbox?.alifBalance || '0'} className="font-semibold" />
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/10 mt-1">
                  <span className="font-semibold text-sm">{t('total')}</span>
                  <MoneyDisplay
                    amount={cashbox?.totalBalance || '0'}
                    className="text-lg font-bold text-primary"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('last7Days')}</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.last7DaysSales ? (
              <SalesBarChart data={dashboard.last7DaysSales} />
            ) : (
              <Skeleton className="h-60 w-full rounded-xl" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('topProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <TopProductsPieChart data={topProducts} />
            ) : (
              <Skeleton className="h-60 w-full rounded-xl" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Expenses + Telegram Daily Report widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fixed Expenses summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                💸 Хароҷоти моҳ
              </CardTitle>
              <button
                onClick={() => navigate('/app/expenses/fixed')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Ҳамаро бин →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {fixedSummary ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5">
                  <span className="text-sm text-muted-foreground">Пардохта</span>
                  <MoneyDisplay amount={fixedSummary.totalPaid} className="font-semibold text-emerald-600" />
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/5">
                  <span className="text-sm text-muted-foreground">Интизор</span>
                  <MoneyDisplay amount={fixedSummary.totalPending} className="font-semibold text-amber-600" />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {fixedSummary.paidCount}/{fixedSummary.count} пардохта шуд
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <p>Ин моҳ хароҷоти доимӣ нест</p>
                <button
                  onClick={() => navigate('/app/expenses/fixed')}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Илова кун
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telegram Daily Report widget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              📊 Ҳисоботи охир (Telegram)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestTelegramReport ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(latestTelegramReport.date).toLocaleDateString('ru-RU')}
                </p>
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                  <span className="text-sm text-muted-foreground">Тавоноии оғоз</span>
                  <MoneyDisplay amount={latestTelegramReport.openingBalance} className="font-semibold" />
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-red-500/5">
                  <span className="text-sm text-muted-foreground">Хароҷот</span>
                  <MoneyDisplay amount={latestTelegramReport.totalExpenses} className="font-semibold text-red-500" />
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5">
                  <span className="text-sm text-muted-foreground">Монанда</span>
                  <MoneyDisplay amount={latestTelegramReport.closingBalance} className="font-semibold text-emerald-600" />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Ҳисоботи Telegram дар бот фиристед
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ShoppingCart, label: t('newSale'), path: '/app/sales', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
              { icon: Package, label: t('addPurchase'), path: '/app/suppliers', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
              { icon: ClipboardList, label: t('dailyReport'), path: '/app/daily-report/new', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
              { icon: BarChart3, label: t('viewReports'), path: '/app/reports', color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
            ].map(({ icon: Icon, label, path, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-sm font-medium',
                  color
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
