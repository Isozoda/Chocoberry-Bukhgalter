import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DollarSign, AlertTriangle, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PageHeader } from '@/components/ui/PageHeader'
import { employeesApi } from '@/api/employees.api'
import { formatDate } from '@/utils/date.util'
import EmployeeForm from './EmployeeForm'
import PayEmployeeForm from './PayEmployeeForm'
import FineForm from './FineForm'
import PayrollCalculator from './PayrollCalculator'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { EmployeePayment, EmployeeFine } from '@/types/employee.types'

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('employees')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [showFine, setShowFine] = useState(false)
  const [showCalc, setShowCalc] = useState(false)

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(id!),
    enabled: !!id,
  })

  const { data: payments } = useQuery({
    queryKey: ['employee-payments', id],
    queryFn: () => employeesApi.getPayments(id!),
    enabled: !!id,
  })

  const { data: fines } = useQuery({
    queryKey: ['employee-fines', id],
    queryFn: () => employeesApi.getFines(id!),
    enabled: !!id,
  })

  const paymentColumns: ColumnDef<EmployeePayment>[] = [
    {
      key: 'paidAt',
      header: t('date'),
      cell: (row) => <span className="text-sm">{formatDate(row.paidAt)}</span>,
    },
    {
      key: 'amount',
      header: t('amount'),
      cell: (row) => <MoneyDisplay amount={row.amount} className="font-semibold text-green-600" />,
    },
    {
      key: 'paymentType',
      header: t('paymentType'),
      cell: (row) => <Badge variant="outline">{t(`paymentTypes.${row.paymentType}`)}</Badge>,
    },
    {
      key: 'notes',
      header: t('note'),
      cell: (row) => <span className="text-sm text-muted-foreground">{row.notes || '—'}</span>,
    },
  ]

  const fineColumns: ColumnDef<EmployeeFine>[] = [
    {
      key: 'date',
      header: t('date'),
      cell: (row) => <span className="text-sm">{formatDate(row.date)}</span>,
    },
    {
      key: 'amount',
      header: t('amount'),
      cell: (row) => <MoneyDisplay amount={row.amount} className="font-semibold text-red-600" />,
    },
    {
      key: 'reason',
      header: t('reason'),
      cell: (row) => <span className="text-sm">{row.reason}</span>,
    },
    {
      key: 'isApplied',
      header: t('applied'),
      cell: (row) => (
        <Badge variant={row.isApplied ? 'success' : 'secondary'}>
          {row.isApplied ? t('yes') : t('no')}
        </Badge>
      ),
    },
  ]

  if (isLoading) return <LoadingSpinner />
  if (!employee) return null

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['employee', id] })
    qc.invalidateQueries({ queryKey: ['employee-payments', id] })
    qc.invalidateQueries({ queryKey: ['employee-fines', id] })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        description={t(`roles.${employee.role}`)}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCalc(true)}>
              <Calculator className="mr-2 h-4 w-4" />
              {t('payrollCalc')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFine(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              {t('addFine')}
            </Button>
            <Button size="sm" onClick={() => setShowPay(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              {t('payEmployee')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('salary')}</p>
            <p className="text-2xl font-bold mt-1">
              <MoneyDisplay amount={employee.salary} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('hireDate')}</p>
            <p className="text-2xl font-bold mt-1">{formatDate(employee.hireDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('status')}</p>
            <div className="mt-2">
              <Badge variant={employee.isActive ? 'success' : 'secondary'} className="text-sm">
                {employee.isActive ? t('active') : t('inactive')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">{t('paymentsTab')}</TabsTrigger>
          <TabsTrigger value="fines">{t('finesTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-4">
          <DataTable
            columns={paymentColumns}
            data={payments ?? []}
            emptyMessage={t('noPayments')}
          />
        </TabsContent>
        <TabsContent value="fines" className="mt-4">
          <DataTable
            columns={fineColumns}
            data={fines ?? []}
            emptyMessage={t('noFines')}
          />
        </TabsContent>
      </Tabs>

      {showEdit && (
        <EmployeeForm
          employee={employee}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { invalidate(); setShowEdit(false) }}
        />
      )}
      {showPay && (
        <PayEmployeeForm
          employeeId={id!}
          employeeName={employee.name}
          onClose={() => setShowPay(false)}
          onSuccess={() => { invalidate(); setShowPay(false) }}
        />
      )}
      {showFine && (
        <FineForm
          employeeId={id!}
          employeeName={employee.name}
          onClose={() => setShowFine(false)}
          onSuccess={() => { invalidate(); setShowFine(false) }}
        />
      )}
      {showCalc && (
        <PayrollCalculator
          employee={employee}
          onClose={() => setShowCalc(false)}
        />
      )}
    </div>
  )
}
