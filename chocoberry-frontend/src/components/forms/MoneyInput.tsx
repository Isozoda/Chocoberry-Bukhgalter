import { forwardRef } from 'react'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MoneyInputProps extends Omit<NumericFormatProps, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, className, placeholder = '0.00', ...props }, ref) => {
    return (
      <NumericFormat
        getInputRef={ref}
        value={value}
        onValueChange={(values) => onChange?.(values.value)}
        thousandSeparator=","
        decimalScale={2}
        fixedDecimalScale
        decimalSeparator="."
        suffix=" см"
        placeholder={placeholder}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm tabular-nums text-right',
          className
        )}
        customInput={Input}
        {...props}
      />
    )
  }
)
MoneyInput.displayName = 'MoneyInput'
