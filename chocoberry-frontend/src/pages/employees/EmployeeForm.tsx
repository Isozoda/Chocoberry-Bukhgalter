import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { employeesApi } from '@/api/employees.api'
import { employeeSchema } from '@/utils/validation.util'
import type { Employee } from '@/types/employee.types'
import toast from 'react-hot-toast'

interface Props {
  employee?: Employee
  onClose: () => void
  onSuccess: () => void
}

export default function EmployeeForm({ employee, onClose, onSuccess }: Props) {
  const { t } = useTranslation('employees')

  const form = useForm<Partial<Employee>>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      name: employee?.name ?? '',
      role: employee?.role ?? 'STAFF',
      salary: employee?.salary ?? '',
      bonusPercent: employee?.bonusPercent ?? '0',
      hireDate: employee?.hireDate ?? new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: (data: Partial<Employee>) =>
      employee
        ? employeesApi.update(employee.id, data)
        : employeesApi.create(data as Partial<Employee> & { name: string; role: string }),
    onSuccess: () => {
      toast.success(employee ? t('updateSuccess') : t('addSuccess'))
      onSuccess()
    },
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? t('editEmployee') : t('addEmployee')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('role')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OWNER">{t('roles.OWNER')}</SelectItem>
                        <SelectItem value="MANAGER">{t('roles.MANAGER')}</SelectItem>
                        <SelectItem value="STAFF">{t('roles.STAFF')}</SelectItem>
                        <SelectItem value="CASHIER">{t('roles.CASHIER')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('salary')}</FormLabel>
                    <FormControl>
                      <MoneyInput value={field.value ?? ''} onChange={field.onChange} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bonusPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bonusPercent')} (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('hireDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                {t('common:actions.cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? t('common:loading') : t('common:actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

