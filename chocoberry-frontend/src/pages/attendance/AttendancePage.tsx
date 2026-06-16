import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserCheck, Users, UserX, Wallet, TrendingUp, TrendingDown,
  Search, Printer, Download, ChevronLeft, ChevronRight, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { attendanceApi } from '@/api/attendance.api'
import type { AttendanceStatus, UpsertAttendanceDto } from '@/types/attendance.types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; dot: string }> = {
  PRESENT:  { label: 'Ҳозир',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  ABSENT:   { label: 'Ғоиб',     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         dot: 'bg-red-400'     },
  LATE:     { label: 'Дер омад', color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',   dot: 'bg-orange-400'  },
  HALF_DAY: { label: 'Нимрӯз',   color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',   dot: 'bg-yellow-400'  },
  DAY_OFF:  { label: 'Истироҳат', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',       dot: 'bg-blue-400'    },
  SICK:     { label: 'Бемор',    color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20',   dot: 'bg-purple-400'  },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as AttendanceStatus[]

function StatusBadge({ status }: { status: AttendanceStatus | null }) {
  if (!status) return <span className="text-xs text-muted-foreground italic">—</span>
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border', cfg.bg, cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function StatusSelect({ value, onChange }: { value: AttendanceStatus | null; onChange: (s: AttendanceStatus) => void }) {
  const { t } = useTranslation('attendance')
  return (
    <select
      value={value ?? ''}
      onChange={(e) => { if (e.target.value) onChange(e.target.value as AttendanceStatus) }}
      className={cn(
        'bg-background rounded-lg border px-2 py-1.5 text-xs font-medium outline-none cursor-pointer transition-all duration-200 appearance-none',
        'border-border hover:border-border focus:border-orange-500/50 text-foreground',
        value ? `${STATUS_CONFIG[value].color} ${STATUS_CONFIG[value].bg}` : 'text-muted-foreground',
      )}
    >
      <option value="" className="bg-background text-muted-foreground">— {t('selectStatus')} —</option>
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-background text-foreground">
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  )
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function thisMonthStr() {
  return new Date().toISOString().slice(0, 7)
}
function getMondayOfWeek(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}
function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
function formatDisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tg-TJ', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatMoney(v: string | number) {
  const n = parseFloat(v.toString())
  return isNaN(n) ? '0' : n.toLocaleString('ru-RU', { minimumFractionDigits: 2 })
}

// ─── Day name map ────────────────────────────────────────────────────────────
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// ─── Main component ──────────────────────────────────────────────────────────
export default function AttendancePage() {
  const { t } = useTranslation('attendance')
  const qc = useQueryClient()

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(todayStr()))
  const [selectedMonth, setSelectedMonth] = useState(thisMonthStr)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | ''>('')
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null)

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: daily, isLoading: dailyLoading } = useQuery({
    queryKey: ['attendance', 'daily', selectedDate],
    queryFn: () => attendanceApi.getDaily(selectedDate),
  })

  const { data: weekly, isLoading: weeklyLoading } = useQuery({
    queryKey: ['attendance', 'weekly', weekStart],
    queryFn: () => attendanceApi.getWeekly(weekStart),
    enabled: activeTab === 'weekly',
  })

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['attendance', 'monthly', selectedMonth],
    queryFn: () => attendanceApi.getMonthly(selectedMonth),
    enabled: activeTab === 'monthly',
  })

  // ─── Mutation ──────────────────────────────────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: ({ empId, dto }: { empId: string; dto: UpsertAttendanceDto }) =>
      attendanceApi.upsert(empId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
      toast.success(t('saveSuccess'))
    },
    onError: () => toast.error(t('saveError')),
  })

  const handleStatusChange = useCallback(
    (empId: string, status: AttendanceStatus, date: string, existing: any) => {
      upsertMutation.mutate({
        empId,
        dto: {
          date,
          status,
          note: existing?.note ?? undefined,
          bonus: parseFloat(existing?.bonus ?? '0') || 0,
          penalty: parseFloat(existing?.penalty ?? '0') || 0,
          overtimePay: parseFloat(existing?.overtimePay ?? '0') || 0,
        },
      })
    },
    [upsertMutation],
  )

  const handleFieldSave = useCallback(
    (
      empId: string,
      date: string,
      status: AttendanceStatus,
      field: 'bonus' | 'penalty' | 'overtimePay' | 'note',
      value: string | number,
      existing: any,
    ) => {
      upsertMutation.mutate({
        empId,
        dto: {
          date,
          status: status || 'PRESENT',
          note: field === 'note' ? (value as string) : (existing?.note ?? undefined),
          bonus: field === 'bonus' ? Number(value) : parseFloat(existing?.bonus ?? '0') || 0,
          penalty: field === 'penalty' ? Number(value) : parseFloat(existing?.penalty ?? '0') || 0,
          overtimePay: field === 'overtimePay' ? Number(value) : parseFloat(existing?.overtimePay ?? '0') || 0,
        },
      })
    },
    [upsertMutation],
  )

  // ─── Filtered employees (daily) ───────────────────────────────────────────
  const filteredDaily = useMemo(() => {
    if (!daily) return []
    return daily.employees.filter((item) => {
      const nameMatch = item.employee.name.toLowerCase().includes(search.toLowerCase())
      const statusMatch = !filterStatus || item.record?.status === filterStatus
      return nameMatch && statusMatch
    })
  }, [daily, search, filterStatus])

  // ─── Filtered employees (weekly) ─────────────────────────────────────────
  const filteredWeekly = useMemo(() => {
    if (!weekly) return []
    return weekly.employees.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [weekly, search])

  // ─── Filtered employees (monthly) ────────────────────────────────────────
  const filteredMonthly = useMemo(() => {
    if (!monthly) return []
    return monthly.employees.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [monthly, search])

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!monthly) return
    const rows = [
      ['Корманд', 'Вазифа', 'Маоши моҳона', 'Рӯзҳои корӣ', 'Ғайбат', 'Бонус', 'Ҷарима', 'Маоши ниҳоӣ'],
      ...monthly.employees.map((e) => [
        e.name, e.role, e.monthlySalary,
        e.workedDays, e.absentDays,
        e.totalBonus, e.totalPenalty, e.finalSalary,
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance-${selectedMonth}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={UserCheck}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="border-border hover:bg-muted">
              <Printer className="h-4 w-4 mr-1.5" />
              {t('printReport')}
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="border-border hover:bg-muted">
              <Download className="h-4 w-4 mr-1.5" />
              {t('exportWeekly')}
            </Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard label={t('totalEmployees')} value={daily?.total ?? 0} isMoney={false} icon={Users} iconColor="text-blue-400" />
        <StatsCard label={t('presentToday')} value={daily?.present ?? 0} isMoney={false} icon={UserCheck} iconColor="text-emerald-400" />
        <StatsCard label={t('absentToday')} value={daily?.absent ?? 0} isMoney={false} icon={UserX} iconColor="text-red-400" />
        <StatsCard label={t('monthlyPayroll')} value={monthly?.totalPayroll ?? '0'} isMoney icon={Wallet} iconColor="text-orange-400" />
        <StatsCard label={t('totalBonuses')} value={monthly?.totalBonuses ?? '0'} isMoney icon={TrendingUp} iconColor="text-emerald-400" />
        <StatsCard label={t('totalPenalties')} value={monthly?.totalPenalties ?? '0'} isMoney icon={TrendingDown} iconColor="text-red-400" />
      </div>

      {/* Controls: search + filter + tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9 !bg-background border-border text-sm hover:border-border transition-colors"
            />
          </div>
          {activeTab === 'daily' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | '')}
              className="bg-background rounded-lg border border-border text-sm text-foreground px-3 py-2 outline-none hover:border-border transition-colors cursor-pointer appearance-none"
            >
              <option value="" className="bg-background">{t('allStatuses')}</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-background">{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-border overflow-hidden bg-card p-1 gap-1">
          {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab
                  ? 'bg-orange-500/15 text-orange-500 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DAILY TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'daily' && (
        <div className="space-y-3">
          {/* Date navigator */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border hover:bg-muted" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background rounded-lg border border-border text-sm text-foreground px-3 py-1.5 outline-none cursor-pointer hover:border-border transition-colors"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border hover:bg-muted" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{formatDisplayDate(selectedDate)}</span>
          </div>

          {/* Daily table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('employee')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('role')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('salary')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('todayStatus')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('bonus')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('penalty')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('overtimePay')}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('note')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredDaily.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">{t('noEmployees')}</td>
                    </tr>
                  ) : (
                    filteredDaily.map(({ employee, record }) => (
                      <tr key={employee.id} className="border-b border-border hover:bg-background transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">{employee.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{employee.role}</td>
                        <td className="px-4 py-3 text-foreground font-mono text-xs">{formatMoney(employee.salary)} см</td>
                        <td className="px-4 py-3">
                          <StatusSelect
                            value={record?.status ?? null}
                            onChange={(s) => handleStatusChange(employee.id, s, selectedDate, record)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <MoneyInput
                            value={record?.bonus ?? '0'}
                            disabled={!record}
                            onBlur={(v) => handleFieldSave(employee.id, selectedDate, record!.status, 'bonus', v, record)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <MoneyInput
                            value={record?.penalty ?? '0'}
                            disabled={!record}
                            onBlur={(v) => handleFieldSave(employee.id, selectedDate, record!.status, 'penalty', v, record)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <MoneyInput
                            value={record?.overtimePay ?? '0'}
                            disabled={!record}
                            onBlur={(v) => handleFieldSave(employee.id, selectedDate, record!.status, 'overtimePay', v, record)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8 rounded-lg transition-all duration-200',
                              record?.note 
                                ? 'bg-orange-600 text-white shadow-lg opacity-100'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                            disabled={!record}
                            onClick={() => {
                              if (!record) return
                              setEditingNotes((prev) => ({ ...prev, [employee.id]: record.note ?? '' }))
                              setShowNoteFor(employee.id)
                            }}
                          >
                            <MessageSquare 
                              className={cn(
                                'h-4 w-4 transition-transform', 
                                record?.note ? 'fill-white stroke-orange-600' : 'fill-none'
                              )} 
                            />
                          </Button>
                          {/* Inline note editor */}
                          {showNoteFor === employee.id && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowNoteFor(null)}>
                              <div className="bg-background border border-border rounded-xl p-4 w-72 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <p className="text-sm font-semibold mb-2 text-foreground">{employee.name} — {t('note')}</p>
                                <textarea
                                  rows={3}
                                  value={editingNotes[employee.id] ?? ''}
                                  onChange={(e) => setEditingNotes((prev) => ({ ...prev, [employee.id]: e.target.value }))}
                                  className="w-full rounded-lg border border-border bg-muted/50 text-sm text-foreground px-3 py-2 outline-none resize-none"
                                  placeholder={t('addNote')}
                                />
                                <div className="flex gap-2 mt-3 justify-end">
                                  <Button variant="ghost" size="sm" onClick={() => setShowNoteFor(null)} className="text-muted-foreground">Бекор</Button>
                                  <Button size="sm" onClick={() => {
                                    handleFieldSave(employee.id, selectedDate, record!.status, 'note', editingNotes[employee.id] ?? '', record)
                                    setShowNoteFor(null)
                                  }} className="bg-orange-600 hover:bg-orange-700 text-white">Нигоҳ дор</Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── WEEKLY TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'weekly' && (
        <div className="space-y-3">
          {/* Week navigator */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border hover:bg-muted" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(getMondayOfWeek(e.target.value))}
              className="bg-background rounded-lg border border-border text-sm text-foreground px-3 py-1.5 outline-none cursor-pointer hover:border-border transition-colors"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border hover:bg-muted" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {formatDisplayDate(weekStart)} — {weekly ? formatDisplayDate(weekly.weekEnd) : ''}
            </span>
          </div>

          {/* Weekly grid */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="sticky left-0 z-10 bg-muted/50 text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">{t('employee')}</th>
                    {weekly?.days.map((day) => {
                      const isToday = day === todayStr()
                      const dow = new Date(day).getDay()
                      return (
                        <th key={day} className={cn('text-center px-2 py-3 text-xs font-semibold uppercase tracking-wider min-w-[72px]', isToday ? 'text-orange-400' : 'text-muted-foreground')}>
                          <div>{t(DAY_KEYS[dow])}</div>
                          <div className={cn('text-[10px] font-normal mt-0.5', isToday ? 'text-orange-400/70' : 'text-muted-foreground/70')}>{day.slice(5)}</div>
                        </th>
                      )
                    })}
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('weeklyWorkedDays')}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('weeklySalary')}</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: 10 }).map((_, j) => (
                          <td key={j} className="px-2 py-3">
                            <div className="h-7 bg-muted rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredWeekly.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-sm text-muted-foreground">{t('noEmployees')}</td>
                    </tr>
                  ) : (
                    filteredWeekly.map((emp) => (
                      <tr key={emp.employeeId} className="border-b border-border hover:bg-background transition-colors">
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-xs">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        {weekly?.days.map((day) => {
                          const rec = emp.days[day]
                          return (
                            <td key={day} className="px-2 py-2 text-center">
                              <StatusSelect
                                value={rec?.status ?? null}
                                onChange={(s) => handleStatusChange(emp.employeeId, s, day, rec)}
                              />
                            </td>
                          )
                        })}
                        <td className="text-center px-3 py-2">
                          <span className="text-sm font-semibold text-foreground">{emp.workedDays}</span>
                        </td>
                        <td className="text-right px-4 py-2">
                          <span className="text-sm font-mono text-emerald-400">{formatMoney(emp.weeklySalary)} см</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MONTHLY TAB ────────────────────────────────────────────────── */}
      {activeTab === 'monthly' && (
        <div className="space-y-3">
          {/* Month navigator */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 border border-border hover:bg-muted"
              onClick={() => {
                const d = new Date(selectedMonth + '-01')
                d.setMonth(d.getMonth() - 1)
                setSelectedMonth(d.toISOString().slice(0, 7))
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-background rounded-lg border border-border text-sm text-foreground px-3 py-1.5 outline-none cursor-pointer hover:border-border transition-colors"
            />
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 border border-border hover:bg-muted"
              onClick={() => {
                const d = new Date(selectedMonth + '-01')
                d.setMonth(d.getMonth() + 1)
                setSelectedMonth(d.toISOString().slice(0, 7))
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {monthly && (
              <span className="text-xs text-muted-foreground">
                {monthly.workingDaysInMonth} {t('workingDays')}
              </span>
            )}
          </div>

          {/* Monthly summary table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="sticky left-0 z-10 bg-muted/50 text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('employee')}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('monthlySalary')}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('dailyRate')}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('workedDays')}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('absentDays')}</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('lateDays')}</th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wider">{t('bonus')}</th>
                    <th className="text-right px-3 py-3 text-xs font-semibold text-red-600 uppercase tracking-wider">{t('penalty')}</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-orange-500 uppercase tracking-wider">{t('finalSalary')}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredMonthly.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-sm text-muted-foreground">{t('noEmployees')}</td>
                    </tr>
                  ) : (
                    filteredMonthly.map((emp) => (
                      <tr key={emp.employeeId} className="border-b border-border hover:bg-background transition-colors">
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right px-4 py-3 font-mono text-foreground text-xs">{formatMoney(emp.monthlySalary)} см</td>
                        <td className="text-right px-4 py-3 font-mono text-muted-foreground text-xs">{formatMoney(emp.dailyRate)} см</td>
                        <td className="text-center px-3 py-3">
                          <span className="text-sm font-semibold text-white">{emp.workedDays}</span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={cn('text-sm font-semibold', emp.absentDays > 0 ? 'text-red-400' : 'text-muted-foreground')}>
                            {emp.absentDays}
                          </span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <span className={cn('text-sm font-semibold', emp.lateDays > 0 ? 'text-orange-400' : 'text-muted-foreground')}>
                            {emp.lateDays}
                          </span>
                        </td>
                        <td className="text-right px-3 py-3">
                          <span className="text-sm font-mono text-emerald-400">
                            {parseFloat(emp.totalBonus) > 0 ? `+${formatMoney(emp.totalBonus)}` : '—'}
                          </span>
                        </td>
                        <td className="text-right px-3 py-3">
                          <span className="text-sm font-mono text-red-400">
                            {parseFloat(emp.totalPenalty) > 0 ? `-${formatMoney(emp.totalPenalty)}` : '—'}
                          </span>
                        </td>
                        <td className="text-right px-4 py-3">
                          <span className="text-sm font-bold font-mono text-orange-400">
                            {formatMoney(emp.finalSalary)} см
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Totals row */}
                  {monthly && filteredMonthly.length > 0 && (
                    <tr className="bg-muted/50 border-t-2 border-border">
                      <td className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Ҷамъ</td>
                      <td colSpan={6} />
                      <td className="text-right px-3 py-3 font-mono text-sm font-bold text-emerald-400">
                        +{formatMoney(monthly.totalBonuses)} см
                      </td>
                      <td className="text-right px-3 py-3 font-mono text-sm font-bold text-red-400">
                        -{formatMoney(monthly.totalPenalties)} см
                      </td>
                      <td className="text-right px-4 py-3 font-mono text-sm font-bold text-orange-500">
                        {formatMoney(monthly.totalPayroll)} см
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reusable inline money input ──────────────────────────────────────────────
function MoneyInput({ value, disabled, onBlur }: { value: string; disabled: boolean; onBlur: (v: number) => void }) {
  const [local, setLocal] = useState(value)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setLocal(value)
  }, [value, focused])

  return (
    <input
      type="number"
      min="0"
      step="0.01"
      value={local}
      disabled={disabled}
      onChange={(e) => setLocal(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        const n = parseFloat(local)
        if (!isNaN(n) && n !== parseFloat(value)) onBlur(n)
      }}
      className={cn(
        'bg-background w-20 rounded-md border text-xs px-2 py-1.5 font-mono outline-none transition-all duration-200 appearance-none',
        disabled
          ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
          : 'border-border text-foreground hover:border-border focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-inner',
      )}
    />
  )
}
