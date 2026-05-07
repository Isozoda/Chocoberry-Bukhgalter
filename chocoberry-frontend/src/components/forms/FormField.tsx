import { useFormContext } from 'react-hook-form'
import { FormControl, FormField as BaseFormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface FormFieldWrapperProps {
  name: string
  label: string
  required?: boolean
  children: (field: ReturnType<ReturnType<typeof useFormContext>['register']> & { value: unknown; onChange: (v: unknown) => void }) => React.ReactNode
}

export function FormFieldWrapper({ name, label, required, children }: FormFieldWrapperProps) {
  const { control } = useFormContext()

  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {children(field as unknown as Parameters<typeof children>[0])}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
