import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, CheckCircle2, Clock, Zap, Droplets, Home, Receipt, Wifi, Truck, Brush, Package, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/ui/PageHeader'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatsCard } from '@/components/ui/StatsCard'
import { fixedExpensesApi, type CreateFixedExpenseDto, type FixedExpense } from '@/api/fixed-expenses.api'
import { formatDate } from '@/utils/date.util'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'electricity', label: 'Барқ', icon: Zap, color: 'text-yellow-500' },
  { key: 'water', label: 'Об', icon: Droplets, color: 'text-blue-500' },
  { key: 'rent', label: 'Арендо', icon: Home, color: 'text-purple-500' },
  { key: 'tax', label: 'Андоз', icon: Receipt, color: 'text-red-500' },
  { key: 'internet', label: 'Интернет', icon: Wifi, color: 'text-green-500' },
  { key: 'logistics', label: 'Логистика', icon: Truck, color: 'text-orange-500' },
  { key: 'cleaning', label: 'Тозакунӣ', icon: Brush, color: 'text-teal-500' },
  { key: 'other', label: 'Дигар', icon: Package, color: 'text-gray-500' },
]

const PERIODS = [
  { key: 'monthly', label: 'Моҳона' },
  { key: 'weekly', label: 'Ҳафтаина' },
  { key: 'yearly', label: 'Солона' },
  { key: 'once', label: 'Якбора' },
]

function getCatMeta(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface ExpenseFormProps {
  initial?: FixedExpense
  onClose: () => void
  onSuccess: () => void
}

function ExpenseForm({ initial, onClose, onSuccess }: ExpenseFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'electricity')
  const [amount, setAmount] = useState(initial ? String(parseFloat(initial.amount)) : '')
  const [period, setPeriod] = useState(initial?.period ?? 'monthly')
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.slice(0, 10) : '')
  const [isPaid, setIsPaid] = useState(initial?.isPaid ?? false)
  const [note, setNote] = useState(initial?.note ?? '')

  const qc = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (dto: CreateFixedExpenseDto) =>
      initial ? fixedExpensesApi.update(initial.id, dto) : fixedExpensesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed-expenses'] })
      toast.success(initial ? 'Навсозӣ шуд' : 'Илова шуд')
      onSuccess()
    },
    onError: () => toast.error('Хато рӯй дод'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !dueDate || !category || !period) {
      toast.error('Ҳамаи майдонҳоро пур кунед')
      return
    }
    createMutation.mutate({ name, category, amount: parseFloat(amount), period, dueDate, isPaid, note: note || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label>Категория</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  <div className="flex items-center gap-2">
                    <c.icon className={cn('h-4 w-4', c.color)} />
                    <span>{c.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Ном</Label>
          <Input placeholder="БАДК, Об, Иҷора..." value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Миқдор (сомонӣ)</Label>
            <Input type="number" min="0" step="0.01" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Давра</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Муҳлати пардохт</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPaid"
            className="h-4 w-4 rounded"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
          />
          <Label htmlFor="isPaid" className="cursor-pointer">Пардохт шудааст</Label>
        </div>

        <div className="space-y-1.5">
          <Label>Тавзеҳ (ихтиёрӣ)</Label>
          <Input placeholder="Эзоҳ..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Бекор кун</Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Нигоҳ...' : 'Сабт кун'}
        </Button>
      </div>
    </form>
  )
}

export default function FixedExpensesPage() {
  const qc = useQueryClient()
  const [month, setMonth] = useState(currentMonth())
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<FixedExpense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['fixed-expenses', month],
    queryFn: () => fixedExpensesApi.list({ month }),
  })

  const { data: summary } = useQuery({
    queryKey: ['fixed-expenses', 'summary', month],
    queryFn: () => fixedExpensesApi.summary(month),
  })

  const markPaidMutation = useMutation({
    mutationFn: fixedExpensesApi.markPaid,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed-expenses'] })
      toast.success('Пардохт шуд')
    },
    onError: () => toast.error('Хато'),
  })

  const deleteMutation = useMutation({
    mutationFn: fixedExpensesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed-expenses'] })
      toast.success('Нест шуд')
      setDeleteId(null)
    },
  })

  const grouped = useMemo(() => {
    const map: Record<string, FixedExpense[]> = {}
    for (const e of expenses) {
      if (!map[e.category]) map[e.category] = []
      map[e.category].push(e)
    }
    return map
  }, [expenses])

  const monthLabel = (() => {
    const parts = month.split('-')
    if (parts.length < 2) return month
    const y = parseInt(parts[0])
    const m = parseInt(parts[1])
    if (isNaN(y) || isNaN(m)) return month
    return new Date(y, m - 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  })()

  const prevMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const nextMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Хароҷоти доимӣ"
        description="Коммуналка, арендо, андоз ва дигар хароҷотҳои доимӣ"
        icon={TrendingDown}
        action={
          <Button onClick={() => { setEditItem(null); setShowForm(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Хароҷот илова кун
          </Button>
        }
      />

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={prevMonth}>{'←'}</Button>
        <span className="font-semibold text-base capitalize min-w-[160px] text-center">{monthLabel}</span>
        <Button variant="outline" size="sm" onClick={nextMonth}>{'→'}</Button>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard label="Умумӣ пардохта" value={summary.totalPaid ?? '0'} isMoney icon={CheckCircle2} iconColor="text-emerald-500" />
          <StatsCard label="Интизор" value={summary.totalPending ?? '0'} isMoney icon={Clock} iconColor="text-amber-500" />
          <StatsCard label="Ҳамагӣ" value={`${summary.paidCount ?? 0} / ${summary.count ?? 0}`} icon={TrendingDown} />
        </div>
      )}

      {/* Grouped list */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Бор мешавад...</div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingDown className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Ин моҳ хароҷоти доимӣ нест</p>
            <Button className="mt-4" onClick={() => { setEditItem(null); setShowForm(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Илова кун
            </Button>
          </CardContent>
        </Card>
      ) : (
        CATEGORIES.filter((c) => grouped[c.key]?.length).map((cat) => {
          const CatIcon = cat.icon
          return (
            <Card key={cat.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CatIcon className={cn('h-4 w-4', cat.color)} />
                  {cat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[cat.key].map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-colors',
                      e.isPaid
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-muted/40 border-transparent'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{e.name}</p>
                        {e.isPaid ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Пардохт
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">
                            <Clock className="h-3 w-3 mr-0.5" /> Интизор
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Муҳлат: {formatDate(e.dueDate)} · {PERIODS.find((p) => p.key === e.period)?.label}
                      </p>
                      {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <MoneyDisplay amount={e.amount} className="font-semibold text-sm" />
                      {!e.isPaid && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => markPaidMutation.mutate(e.id)}
                          disabled={markPaidMutation.isPending}
                        >
                          Пардохт
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => { setEditItem(e); setShowForm(true) }}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(e.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { if (!v) { setShowForm(false); setEditItem(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Хароҷотро таҳрир кун' : 'Хароҷоти нав'}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            initial={editItem ?? undefined}
            onClose={() => { setShowForm(false); setEditItem(null) }}
            onSuccess={() => { setShowForm(false); setEditItem(null) }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Нест кардан?"
        description="Ин хароҷот нест карда мешавад. Барнагашта мешавад."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
