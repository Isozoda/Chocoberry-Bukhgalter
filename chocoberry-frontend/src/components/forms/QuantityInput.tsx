import { forwardRef } from 'react'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface QuantityInputProps extends Omit<NumericFormatProps, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  unit?: string
  className?: string
}

export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  ({ value, onChange, unit, className, ...props }, ref) => {
    return (
      <NumericFormat
        getInputRef={ref}
        value={value}
        onValueChange={(values) => onChange?.(values.value)}
        decimalScale={3}
        fixedDecimalScale={false}
        suffix={unit ? ` ${unit}` : undefined}
        placeholder="0"
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm tabular-nums',
          className
        )}
        customInput={Input}
        {...props}
      />
    )
  }
)
QuantityInput.displayName = 'QuantityInput'
