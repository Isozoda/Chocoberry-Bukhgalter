import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { MoneyDisplay } from '@/components/ui/MoneyDisplay'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { employeesApi } from '@/api/employees.api'
import EmployeeForm from './EmployeeForm'
import type { Employee } from '@/types/employee.types'
import type { ColumnDef } from '@/components/ui/DataTable'

export default function EmployeesPage() {
  const { t } = useTranslation('employees')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  })

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'name',
      header: t('name'),
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{t(`roles.${row.role}`)}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('role'),
      cell: (row) => (
        <Badge variant="outline">{t(`roles.${row.role}`)}</Badge>
      ),
    },
    {
      key: 'salary',
      header: t('salary'),
      cell: (row) => <MoneyDisplay amount={row.salary} />,
    },
    {
      key: 'hireDate',
      header: t('hireDate'),
      cell: (row) => <span className="text-sm text-muted-foreground">{row.hireDate}</span>,
    },
    {
      key: 'status',
      header: t('status'),
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'secondary'}>
          {row.isActive ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/app/employees/${row.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={Users}
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addEmployee')}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          label={t('totalEmployees')}
          value={employees?.length ?? 0}
          isMoney={false}
          icon={Users}
        />
        <StatsCard
          label={t('activeEmployees')}
          value={employees?.filter((e) => e.isActive).length ?? 0}
          isMoney={false}
        />
      </div>

      <DataTable
        columns={columns}
        data={employees ?? []}
        isLoading={isLoading}
        emptyMessage={t('noEmployees')}
      />

      {showForm && (
        <EmployeeForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['employees'] })
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
