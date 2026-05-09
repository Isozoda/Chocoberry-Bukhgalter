import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calculator, Plus, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { dailyReportApi } from '@/api/daily-report.api'
import { salesApi } from '@/api/sales.api'
import { dailyReportSchema } from '@/utils/validation.util'
import {
  toDecimal, addMoney, subtractMoney,
} from '@/utils/decimal.util'
import type { CreateDailyReportDto } from '@/types/daily-report.types'
import toast from 'react-hot-toast'

export default function DailyReportForm() {
  const { t } = useTranslation('daily-report')
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const { data: todayStats } = useQuery({
    queryKey: ['sales-today-stats'],
    queryFn: salesApi.statsToday,
  })

  const form = useForm<CreateDailyReportDto>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      date: today,
      totalSales: '0',
      locations: [{ label: t('mainLocation'), amount: '0' }],
      extraIncome: [],
      operationalExp: '0',
      consumables: [],
      ownerDraws: [],
      supplierPurchases: [],
      charityAmount: '0',
      notes: '',
    },
  })

  const { fields: locationFields, append: addLocation, remove: removeLocation } = useFieldArray({
    control: form.control,
    name: 'locations',
  })

  const { fields: extraIncomeFields, append: addExtraIncome, remove: removeExtraIncome } = useFieldArray({
    control: form.control,
    name: 'extraIncome',
  })

  const { fields: consumableFields, append: addConsumable, remove: removeConsumable } = useFieldArray({
    control: form.control,
    name: 'consumables',
  })

  const { fields: ownerDrawFields, append: addOwnerDraw, remove: removeOwnerDraw } = useFieldArray({
    control: form.control,
    name: 'ownerDraws',
  })

  const { fields: supplierFields, append: addSupplier, remove: removeSupplier } = useFieldArray({
    control: form.control,
    name: 'supplierPurchases',
  })

  const watched = useWatch({ control: form.control })

  useEffect(() => {
    if (todayStats?.totalSales) {
      const total = (todayStats as any).totalSales ?? (todayStats as any).total ?? '0'
      form.setValue('totalSales', total.toString())
      if (form.getValues('locations.0')) {
        form.setValue('locations.0.amount', total.toString())
      }
    }
  }, [todayStats, form])

  const locationsTotal = (watched.locations ?? []).reduce(
    (sum, loc) => addMoney(sum, toDecimal(loc?.amount || '0')),
    toDecimal('0')
  )

  const extraTotal = (watched.extraIncome ?? []).reduce(
    (sum, inc) => addMoney(sum, toDecimal(inc?.amount || '0')),
    toDecimal('0')
  )

  const totalIncome = addMoney(locationsTotal, extraTotal)

  const opExp = toDecimal(watched.operationalExp || '0')
  const consumablesTotal = (watched.consumables ?? []).reduce(
    (sum, c) => addMoney(sum, toDecimal(c?.amount || '0')),
    toDecimal('0')
  )
  const ownerDrawsTotal = (watched.ownerDraws ?? []).reduce(
    (sum, d) => addMoney(sum, toDecimal(d?.amount || '0')),
    toDecimal('0')
  )
  const supplierTotal = (watched.supplierPurchases ?? []).reduce(
    (sum, s) => addMoney(sum, toDecimal(s?.amount || '0')),
    toDecimal('0')
  )
  const totalExpenses = addMoney(addMoney(addMoney(opExp, consumablesTotal), ownerDrawsTotal), supplierTotal)
  const charity = toDecimal(watched.charityAmount || '0')
  const remainingCash = subtractMoney(subtractMoney(totalIncome, totalExpenses), charity)

  const mutation = useMutation({
    mutationFn: (data: CreateDailyReportDto) => {
      const backendDto = {
        date: data.date,
        totalSales: Number(locationsTotal.toString()),
        extraIncome: Number(extraTotal.toString()),
        operationalExp: Number(data.operationalExp || 0),
        consumablesExp: Number(consumablesTotal.toString()),
        suppliers: (data.supplierPurchases || []).map((s) => ({
          supplierId: s.supplierId || undefined,
          name: s.name || 'Supplier',
          amount: Number(s.amount || 0),
        })),
        draws: (data.ownerDraws || []).map((d) => ({
          ownerName: d.ownerName || 'Owner',
          amount: Number(d.amount || 0),
        })),
        remaining: Number(remainingCash.toString()),
        notes: data.notes,
      }
      return dailyReportApi.create(backendDto as any)
    },
    onSuccess: (data) => {
      toast.success(t('reportSaved'))
      navigate(`/app/daily-report/${data.id}`)
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t('newReport')}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('generalInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-green-600 dark:text-green-400">{t('sales')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {locationFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`locations.${i}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        {i === 0 && <FormLabel>{t('locationLabel')}</FormLabel>}
                        <FormControl>
                          <Input placeholder={t('locationPlaceholder')} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`locations.${i}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        {i === 0 && <FormLabel>{t('amount')}</FormLabel>}
                        <FormControl>
                          <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {i > 0 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLocation(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addLocation({ label: '', amount: '0' })}>
                <Plus className="mr-1 h-3 w-3" />
                {t('addLocation')}
              </Button>

              <Separator />

              <p className="text-sm font-medium text-muted-foreground">{t('extraIncome')}</p>
              {extraIncomeFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`extraIncome.${i}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t('extraIncomeLabel')} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`extraIncome.${i}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormControl>
                          <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeExtraIncome(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addExtraIncome({ label: '', amount: '0' })}>
                <Plus className="mr-1 h-3 w-3" />
                {t('addExtraIncome')}
              </Button>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg mt-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('totalIncome')}</span>
                <MoneyDisplay amount={totalIncome.toString()} className="font-bold text-green-700 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600 dark:text-red-400">{t('expenses')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="operationalExp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('operationalExpenses')}</FormLabel>
                    <FormControl>
                      <MoneyInput value={field.value ?? ''} onChange={field.onChange} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm font-medium text-muted-foreground">{t('consumables')}</p>
              {consumableFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`consumables.${i}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t('consumableLabel')} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`consumables.${i}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormControl>
                          <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeConsumable(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addConsumable({ label: '', amount: '0' })}>
                <Plus className="mr-1 h-3 w-3" />
                {t('addConsumable')}
              </Button>

              <p className="text-sm font-medium text-muted-foreground">{t('ownerDraws')}</p>
              {ownerDrawFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`ownerDraws.${i}.ownerName`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t('ownerName')} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ownerDraws.${i}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormControl>
                          <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOwnerDraw(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addOwnerDraw({ ownerName: '', amount: '0' })}>
                <Plus className="mr-1 h-3 w-3" />
                {t('addOwnerDraw')}
              </Button>

              <p className="text-sm font-medium text-muted-foreground">{t('supplierPayments')}</p>
              {supplierFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`supplierPurchases.${i}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t('supplierName')} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`supplierPurchases.${i}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormControl>
                          <MoneyInput value={field.value} onChange={field.onChange} placeholder="0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSupplier(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addSupplier({ name: '', amount: '0' })}>
                <Plus className="mr-1 h-3 w-3" />
                {t('addSupplier')}
              </Button>

              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">{t('totalExpenses')}</span>
                <MoneyDisplay amount={totalExpenses.toString()} className="font-bold text-red-700 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {t('charitySection')}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{t('charityTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="charityAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('charityAmount')}</FormLabel>
                    <FormControl>
                      <MoneyInput value={field.value ?? ''} onChange={field.onChange} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('totalIncome')}</span>
                <MoneyDisplay amount={totalIncome.toString()} className="text-green-600" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('totalExpenses')}</span>
                <MoneyDisplay amount={totalExpenses.toString()} className="text-red-600" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('charity')}</span>
                <MoneyDisplay amount={charity.toString()} className="text-orange-600" />
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('remainingCash')}</span>
                <MoneyDisplay
                  amount={remainingCash.toString()}
                  className={remainingCash.gte(0) ? 'text-green-600' : 'text-red-600'}
                />
              </div>
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('notes')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('notesPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/app/daily-report')}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? t('common:loading') : t('saveReport')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
