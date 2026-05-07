import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { toDecimal, addMoney, subtractMoney, multiplyMoney } from '@/utils/decimal.util'
import type { Employee } from '@/types/employee.types'

interface Props {
  employee: Employee
  onClose: () => void
}

export default function PayrollCalculator({ employee, onClose }: Props) {
  const { t } = useTranslation('employees')
  const [workedDays, setWorkedDays] = useState('26')
  const [totalDays, setTotalDays] = useState('26')
  const [bonusAmount, setBonusAmount] = useState('0')
  const [finesAmount, setFinesAmount] = useState('0')
  const [advancesAmount, setAdvancesAmount] = useState('0')

  const baseSalary = toDecimal(employee.salary)
  const worked = toDecimal(workedDays || '0')
  const total = toDecimal(totalDays || '1')
  const bonus = toDecimal(bonusAmount || '0')
  const fines = toDecimal(finesAmount || '0')
  const advances = toDecimal(advancesAmount || '0')

  const earnedSalary = total.gt(0)
    ? baseSalary.mul(worked).div(total)
    : toDecimal('0')

  const bonusPct = toDecimal(employee.bonusPercent || '0')
  const autoBonus = bonusPct.gt(0) ? earnedSalary.mul(bonusPct).div(100) : toDecimal('0')
  const totalBonus = addMoney(bonus, autoBonus)
  const grossPay = addMoney(earnedSalary, totalBonus)
  const deductions = addMoney(fines, advances)
  const netPay = subtractMoney(grossPay, deductions)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payrollCalc')}: {employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('workedDays')}</Label>
              <Input
                type="number"
                value={workedDays}
                onChange={(e) => setWorkedDays(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('totalDays')}</Label>
              <Input
                type="number"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>{t('bonusAmount')}</Label>
              <Input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('fines')}</Label>
              <Input
                type="number"
                value={finesAmount}
                onChange={(e) => setFinesAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('advances')}</Label>
              <Input
                type="number"
                value={advancesAmount}
                onChange={(e) => setAdvancesAmount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <Card>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('salary')}</span>
                <MoneyDisplay amount={employee.salary} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {workedDays}/{totalDays} {t('days')}
                </span>
                <MoneyDisplay amount={earnedSalary.toString()} />
              </div>
              {totalBonus.gt(0) && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{t('bonus')}</span>
                  <MoneyDisplay amount={totalBonus.toString()} />
                </div>
              )}
              {fines.gt(0) && (
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>{t('fines')}</span>
                  <span>- <MoneyDisplay amount={fines.toString()} /></span>
                </div>
              )}
              {advances.gt(0) && (
                <div className="flex justify-between text-orange-600">
                  <span>{t('advances')}</span>
                  <span>- <MoneyDisplay amount={advances.toString()} /></span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>{t('netPay')}</span>
                <MoneyDisplay
                  amount={netPay.gt(0) ? netPay.toString() : '0'}
                  className="text-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={onClose}>
            {t('common:actions.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
