import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/api/inventory.api'
import { multiplyMoney, subtractMoney, toDecimal } from '@/utils/decimal.util'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuantityInput } from '@/components/forms/QuantityInput'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import type { InventoryItem } from '@/types/inventory.types'

interface Props {
  item: InventoryItem
  onSuccess?: () => void
}

export default function CleaningForm({ item, onSuccess }: Props) {
  const { t } = useTranslation('inventory')
  const queryClient = useQueryClient()
  const [rawQuantity, setRawQuantity] = useState('')
  const [actualCleaned, setActualCleaned] = useState('')
  const [notes, setNotes] = useState('')

  const lossPct = parseFloat(item.cleaningLossPct || '0')

  const expectedLoss = rawQuantity
    ? multiplyMoney(rawQuantity, lossPct).div(100)
    : toDecimal(0)

  const expectedCleaned = rawQuantity
    ? subtractMoney(rawQuantity, expectedLoss.toString())
    : toDecimal(0)

  const displayCleaned = actualCleaned || expectedCleaned.toFixed(3)
  const displayLoss = rawQuantity
    ? subtractMoney(rawQuantity, displayCleaned.toString()).toFixed(3)
    : '0'

  const mutation = useMutation({
    mutationFn: () =>
      inventoryApi.cleaning(item.id, {
        rawQuantity: parseFloat(rawQuantity),
        actualCleanedQuantity: actualCleaned ? parseFloat(actualCleaned) : undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(
        t('cleaningSuccess', {
          cleaned: displayCleaned,
          raw: rawQuantity,
          loss: displayLoss,
        })
      )
      onSuccess?.()
    },
  })

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label>{t('rawQuantity')} (kg) *</Label>
        <QuantityInput value={rawQuantity} onChange={setRawQuantity} unit="кг" />
      </div>

      {rawQuantity && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('expectedLoss')} ({lossPct}%)</span>
              <span className="tabular-nums">{expectedLoss.toFixed(3)} кг</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('expectedCleaned')}</span>
              <span className="tabular-nums font-medium">{expectedCleaned.toFixed(3)} кг</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label>{t('actualCleaned')} ({t('overrideExpected')})</Label>
        <QuantityInput
          value={actualCleaned}
          onChange={setActualCleaned}
          unit="кг"
          placeholder={rawQuantity ? expectedCleaned.toFixed(3) : '0'}
        />
      </div>

      {rawQuantity && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-4 text-sm">
            <p className="font-medium text-green-800 dark:text-green-400">
              {t('cleaningPreview', {
                raw: rawQuantity,
                cleaned: displayCleaned,
                loss: displayLoss,
                pct: rawQuantity
                  ? subtractMoney('1', toDecimal(displayCleaned).div(toDecimal(rawQuantity)).toString())
                      .abs().times(100).toFixed(1)
                  : '0',
              })}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label>{t('common:labels.notes')}</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <Button
        className="w-full"
        onClick={() => mutation.mutate()}
        disabled={!rawQuantity || mutation.isPending}
      >
        {mutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
        {t('confirmCleaning')}
      </Button>
    </div>
  )
}
