import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { employeesApi } from '@/api/employees.api'

interface EmployeeSelectProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  filterOwners?: boolean
  filterConsumable?: boolean
}

export function EmployeeSelect({
  value,
  onChange,
  placeholder,
  filterOwners,
  filterConsumable,
}: EmployeeSelectProps) {
  const { t } = useTranslation()
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.list,
  })

  const filtered = employees.filter((e) => {
    if (filterOwners) return e.isOwner
    if (filterConsumable) return e.isConsumableBuyer
    return true
  })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder || t('labels.name')} />
      </SelectTrigger>
      <SelectContent>
        {filtered.map((emp) => (
          <SelectItem key={emp.id} value={emp.id}>
            {emp.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
