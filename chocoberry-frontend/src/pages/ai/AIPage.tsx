import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bot, TrendingUp, Package, Lightbulb,
  RefreshCw, Send, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, Info,
  Sparkles, ShoppingCart
} from 'lucide-react'
import { aiApi } from '@/api/ai.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type {
  SalesAnalysisResult, InventoryForecastResult, AdvisorResult,
  SalesPeriod, ForecastDays, InsightType, PriorityType, UrgencyType
} from '@/types/ai.types'

function InsightIcon({ type }: { type: InsightType }) {
  if (type === 'positive') return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
  if (type === 'negative') return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
  return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
}

function PriorityBadge({ priority }: { priority: PriorityType }) {
  const map: Record<PriorityType, { label: string; className: string }> = {
    high: { label: 'МУҲИМ', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    medium: { label: 'МИЁНА', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    low: { label: 'КАМ', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  }
  const { label, className } = map[priority]
  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', className)}>
      {label}
    </span>
  )
}

function UrgencyDot({ urgency }: { urgency: UrgencyType }) {
  const map: Record<UrgencyType, string> = {
    critical: 'bg-red-500',
    warning: 'bg-yellow-500',
    ok: 'bg-green-500',
  }
  return <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', map[urgency])} />
}

function AISkeleton() {
  return (
    <div className="space-y-3 mt-4">
      <Skeleton className="h-4 w-3/4 bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-5/6 bg-muted" />
      <Skeleton className="h-20 w-full bg-muted mt-4" />
      <Skeleton className="h-20 w-full bg-muted" />
    </div>
  )
}

function AILoadingCard() {
  return (
    <Card className="bg-card border-orange-500/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Bot className="h-6 w-6 text-orange-500 animate-pulse" />
            <Sparkles className="h-3 w-3 text-orange-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <span className="text-orange-400 text-sm font-medium animate-pulse">
            Claude AI таҳлил мекунад...
          </span>
        </div>
        <AISkeleton />
      </CardContent>
    </Card>
  )
}

// ─── Tab 1: Sales Analysis ───────────────────────────────────────────────────
function SalesTab() {
  const [period, setPeriod] = useState<SalesPeriod>('week')
  const [result, setResult] = useState<SalesAnalysisResult | null>(null)

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => aiApi.analyzeSales(period),
    onSuccess: (data) => setResult(data),
  })

  const periods: { value: SalesPeriod; label: string }[] = [
    { value: 'day', label: 'Имрӯз' },
    { value: 'week', label: 'Ҳафта' },
    { value: 'month', label: 'Моҳ' },
  ]

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Давра:</span>
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  period === p.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-white hover:bg-muted'
                )}
              >
                {p.label}
              </button>
            ))}
            <Button
              onClick={() => mutate()}
              disabled={isPending}
              className="ml-auto bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              {isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              {isPending ? 'Таҳлил...' : 'Таҳлил кун'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isPending && <AILoadingCard />}

      {/* Error */}
      {isError && (
        <Card className="bg-red-900/10 border-red-500/30">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">
              {(error as Error)?.message || 'Хато рӯй дод. Дубора кӯшиш кунед.'}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !isPending && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-gradient-to-br from-orange-950/30 to-[#0d0d0f] border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-orange-400">
                <Bot className="h-5 w-5" />
                AI Хулоса
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 text-sm leading-relaxed">{result.summary}</p>
              {result.rawData && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Фурӯш', value: `${Number(result.rawData.totalSales).toLocaleString()} см` },
                    { label: 'Хароҷот', value: `${Number(result.rawData.totalExpenses).toLocaleString()} см` },
                    { label: 'Фоида', value: `${Number(result.rawData.netProfit).toLocaleString()} см` },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-bold mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          {result.insights?.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Натиҷаҳо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <InsightIcon type={ins.type} />
                    <p className="text-sm text-foreground/90">{ins.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                  Тавсияҳо
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted space-y-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={rec.priority} />
                      <p className="text-sm font-medium text-foreground">{rec.action}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-0.5">{rec.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Forecast */}
          {result.forecast && (
            <Card className="bg-gradient-to-br from-blue-950/20 to-[#0d0d0f] border-blue-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-blue-300 font-medium">Пешгӯии давраи оянда</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      ~{Number(result.forecast.nextPeriodRevenue).toLocaleString()} см
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Дақиқӣ: {result.forecast.confidence}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !isPending && !isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <Bot className="h-8 w-8 text-orange-500" />
            </div>
            <Sparkles className="h-4 w-4 text-orange-400 absolute -top-1 -right-1" />
          </div>
          <p className="text-muted-foreground text-sm">Давраро интихоб карда, «Таҳлил кун» -ро пахш кунед</p>
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Inventory Forecast ────────────────────────────────────────────────
function InventoryTab() {
  const [days, setDays] = useState<ForecastDays>(7)
  const [result, setResult] = useState<InventoryForecastResult | null>(null)

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => aiApi.forecastInventory(days),
    onSuccess: (data) => setResult(data),
  })

  const dayOptions: ForecastDays[] = [7, 14, 30]

  const urgencyLabel: Record<UrgencyType, string> = {
    critical: 'ФАВРӢ',
    warning: 'ЗУД',
    ok: 'КИФОЯ',
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Рӯзҳои оянда:</span>
            {dayOptions.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  days === d
                    ? 'bg-orange-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-white hover:bg-muted'
                )}
              >
                {d} рӯз
              </button>
            ))}
            <Button
              onClick={() => mutate()}
              disabled={isPending}
              className="ml-auto bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
              {isPending ? 'Пешгӯӣ...' : 'Пешгӯӣ кун'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPending && <AILoadingCard />}

      {isError && (
        <Card className="bg-red-900/10 border-red-500/30">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">
              {(error as Error)?.message || 'Хато рӯй дод. Дубора кӯшиш кунед.'}
            </span>
          </CardContent>
        </Card>
      )}

      {result && !isPending && (
        <div className="space-y-4">
          {/* Critical items */}
          {result.criticalItems?.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ҳолати анбор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.criticalItems.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      item.urgency === 'critical' ? 'bg-red-950/20 border-red-500/20' :
                        item.urgency === 'warning' ? 'bg-yellow-950/20 border-yellow-500/20' :
                          'bg-green-950/20 border-green-500/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <UrgencyDot urgency={item.urgency} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Монд: {item.currentStock} {item.unit} · {item.willRunOutIn}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded',
                        item.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                          item.urgency === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                      )}>
                        {urgencyLabel[item.urgency]}
                      </span>
                      {item.orderNow > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Фармоиш: +{item.orderNow} {item.unit}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Order list */}
          {result.orderList?.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Рӯйхати фармоиш
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.orderList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <UrgencyDot urgency={item.urgency} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.amount} {item.unit}
                        </p>
                      </div>
                    </div>
                    {item.estimatedCost > 0 && (
                      <span className="text-sm font-medium text-orange-400">
                        ~{item.estimatedCost.toLocaleString()} см
                      </span>
                    )}
                  </div>
                ))}
                {result.totalOrderCost > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-bold text-foreground">Ҷамъи фармоиш:</span>
                    <span className="text-lg font-bold text-orange-400">
                      ~{result.totalOrderCost.toLocaleString()} см
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {result.notes && (
            <Card className="bg-blue-950/10 border-blue-500/20">
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">{result.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!result && !isPending && !isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-muted-foreground text-sm">Рӯзҳоро интихоб карда, пешгӯиро оғоз кунед</p>
        </div>
      )}
    </div>
  )
}

// ─── Tab 3: AI Advisor ────────────────────────────────────────────────────────
import { useQuery, useQueryClient } from '@tanstack/react-query'

function AdvisorTab() {
  const [question, setQuestion] = useState('')
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['ai-history'],
    queryFn: aiApi.getHistory,
  })

  const weeklyMutation = useMutation({
    mutationFn: aiApi.weeklyAdvice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] })
    },
  })

  const askMutation = useMutation({
    mutationFn: () => aiApi.askAdvisor(question),
    onSuccess: () => {
      setQuestion('')
      queryClient.invalidateQueries({ queryKey: ['ai-history'] })
    },
  })

  const isPending = weeklyMutation.isPending || askMutation.isPending
  const error = weeklyMutation.error || askMutation.error

  // Scroll to bottom when history changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useState(() => {
    if (history.length > 0) setTimeout(scrollToBottom, 100)
  })

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-280px)]">
      {/* History Area */}
      <Card className="bg-card border-border flex-1 overflow-hidden flex flex-col">
        <CardHeader className="py-3 border-b border-border flex-row items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Таърихи гуфтугӯ
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => weeklyMutation.mutate()}
            disabled={isPending}
            className="h-7 text-[10px] gap-1 hover:bg-muted"
          >
            <Lightbulb className="h-3 w-3" /> Маслиҳати нав
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-orange-500/20">
          {isHistoryLoading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3 bg-muted rounded-2xl rounded-tl-none" />
              <Skeleton className="h-10 w-2/3 ml-auto bg-orange-500/10 rounded-2xl rounded-tr-none" />
            </div>
          )}

          {history.length === 0 && !isHistoryLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <Bot className="h-12 w-12 mb-2 text-muted-foreground" />
              <p className="text-sm">Ҳанӯз гуфтугӯ оғоз нашудааст</p>
            </div>
          )}

          {history.map((msg: any) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user'
                    ? "bg-orange-500 text-white rounded-tr-none"
                    : "bg-muted text-foreground/90 border border-border rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {isPending && (
            <div className="flex items-start gap-2 animate-pulse">
              <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border">
                <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input box */}
      <Card className="bg-card border-border shrink-0">
        <CardContent className="p-3">
          <div className="relative">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Савол диҳед..."
              className="bg-muted border-border text-sm resize-none pr-12 min-h-[60px] focus-visible:ring-orange-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && question.trim()) {
                  e.preventDefault()
                  askMutation.mutate()
                }
              }}
            />
            <Button
              onClick={() => askMutation.mutate()}
              disabled={isPending || !question.trim()}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <Sparkles className="h-3 w-3 text-orange-300 absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Зеҳни сунъӣ</h1>
          <p className="text-sm text-muted-foreground">Claude AI • Таҳлил, пешгӯӣ ва маслиҳат</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales">
        <TabsList className="bg-card border border-border p-1 h-auto">
          <TabsTrigger value="sales" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4" />
            Таҳлили фурӯш
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Package className="h-4 w-4" />
            Пешгӯии анбор
          </TabsTrigger>
          <TabsTrigger value="advisor" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Lightbulb className="h-4 w-4" />
            Маслиҳатгар
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <SalesTab />
        </TabsContent>
        <TabsContent value="inventory" className="mt-4">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="advisor" className="mt-4">
          <AdvisorTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
