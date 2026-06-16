import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { CheckCircle2, Store, Users, Package, ArrowRight, ArrowLeft } from 'lucide-react'
import { businessApi } from '@/api/business.api'
import { businessSetupSchema } from '@/utils/validation.util'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { z } from 'zod'
import type { SetupResponse } from '@/types/business.types'
import strawberryImg from '@/assets/IMG_6686.PNG'

type SetupForm = z.infer<typeof businessSetupSchema>

const WHAT_GETS_CREATED = [
  { icon: Package, label: '14 inventory items (fruits, chocolate, packaging)' },
  { icon: Store, label: '10 products with recipes (BOM)' },
  { icon: Users, label: '5 employees with roles' },
]

const STEPS = [
  { label: 'Business Info', description: 'Tell us about your business' },
  { label: 'Review', description: 'Check what will be created' },
]

export default function BusinessSetupPage() {
  const { t } = useTranslation('business')
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [setupResult, setSetupResult] = useState<SetupResponse | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SetupForm>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues: { name: 'Choco Berry', type: 'FOOD', bonusPercent: '2' },
  })

  const setupMutation = useMutation({
    mutationFn: businessApi.setup,
    onSuccess: (data) => {
      setSetupResult(data)
      setStep(3)
      toast.success('Business set up successfully!')
    },
  })

  if (step === 3 && setupResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full mb-6 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">You&apos;re all set!</h2>
          <p className="text-muted-foreground mb-2">
            Your Choco Berry business has been configured with:
          </p>
          <div className="grid grid-cols-2 gap-3 my-6 text-left">
            {[
              { label: 'Inventory items', value: setupResult.inventoryCount },
              { label: 'Products', value: setupResult.productCount },
              { label: 'Employees', value: setupResult.employeeCount },
            ].map((item) => (
              <div key={item.label} className="bg-card border rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          <Button
            className="w-full h-12 text-sm font-semibold shadow-md shadow-primary/25"
            onClick={() => navigate('/app/dashboard')}
          >
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center bg-white border rounded-2xl overflow-hidden mb-4 shadow-lg">
            <img src={strawberryImg} alt="" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">Set up your business</h1>
          <p className="text-muted-foreground mt-1 text-sm">Takes less than 2 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i + 1 === step
                  ? 'bg-primary text-primary-foreground'
                  : i + 1 < step
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1 < step ? <CheckCircle2 className="h-3 w-3" /> : <span>{i + 1}</span>}
                <span>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i + 1 < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Business information</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your business details below</p>

            <form className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Business name</Label>
                <Input placeholder="e.g. Choco Berry" className="h-11" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Business type</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as 'FOOD')}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOOD">🍕 Food & Beverage</SelectItem>
                    <SelectItem value="RETAIL">🛍️ Retail</SelectItem>
                    <SelectItem value="SERVICE">💼 Service</SelectItem>
                    <SelectItem value="OTHER">📦 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Address <span className="text-muted-foreground">(optional)</span></Label>
                  <Input placeholder="Your address" className="h-11" {...register('address')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Phone <span className="text-muted-foreground">(optional)</span></Label>
                  <Input placeholder="+992 XX XXX XXXX" className="h-11" {...register('phone')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Bonus percent (%)</Label>
                <Input type="number" step="0.1" min="0" max="100" className="h-11" {...register('bonusPercent')} />
                <p className="text-xs text-muted-foreground">Customer loyalty bonus percentage</p>
              </div>

              <Button className="w-full h-11" type="button" onClick={() => setStep(2)}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Ready to launch</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We&apos;ll automatically create the following for <strong>{watch('name')}</strong>:
            </p>

            <div className="space-y-3 mb-6">
              {WHAT_GETS_CREATED.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{label}</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 mb-6">
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <strong>Note:</strong> You can edit, add, or remove any of these items after setup.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" type="button" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                className="flex-1 h-11 shadow-md shadow-primary/25"
                type="button"
                onClick={handleSubmit((data) => setupMutation.mutate(data))}
                disabled={setupMutation.isPending}
              >
                {setupMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up…
                  </span>
                ) : (
                  <>🚀 Launch Business</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
