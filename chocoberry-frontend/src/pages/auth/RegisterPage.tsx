import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { registerSchema } from '@/utils/validation.util'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '@/assets/image.png'
import type { z } from 'zod'

type RegisterForm = z.infer<typeof registerSchema>

const BENEFITS = [
  'Free setup with sample data',
  'POS terminal & inventory tracking',
  'Payroll & daily P&L reports',
]

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      authApi.register({ name: data.name, email: data.email, password: data.password }),
    onSuccess: (data) => {
      login(data.accessToken, data.user)
      toast.success('Account created! Let\'s set up your business.')
      navigate('/setup')
    },
  })

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden p-1.5 border border-white/50">
              <img src={logo} alt="Choco Berry" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold">Choco Berry</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Start managing<br />smarter today
          </h1>
          <p className="text-orange-100 text-lg">
            Join thousands of business owners who trust Choco Berry for their daily operations.
          </p>
        </div>

        <div className="space-y-3">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-3 text-orange-100">
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-sm font-medium">{b}</span>
            </div>
          ))}
        </div>

        <p className="text-orange-200 text-xs">© 2026 Choco Berry Business Suite</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center bg-white rounded-full p-2 mb-4 shadow-xl overflow-hidden border-2 border-orange-100">
              <img src={logo} alt="Choco Berry" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-bold text-primary">Choco Berry</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-muted-foreground mt-1">Get started in under 2 minutes</p>
          </div>

          <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Your full name" className="pl-10 h-11" {...register('name')} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10 h-11" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="pl-10 pr-10 h-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="pl-10 pr-10 h-11"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 transition-all mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
