import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, TrendingUp, BarChart3, Users } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { loginSchema } from '@/utils/validation.util'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '@/assets/image.png'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'

type LoginForm = z.infer<typeof loginSchema>

const FEATURES = [
  { icon: TrendingUp, label: 'Real-time sales tracking' },
  { icon: BarChart3, label: 'Financial analytics & P&L' },
  { icon: Users, label: 'Employee payroll management' },
]

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.accessToken, data.user)
      toast.success('Welcome back!')
      navigate('/app/dashboard')
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
            Your complete<br />business manager
          </h1>
          <p className="text-orange-100 text-lg">
            Track sales, manage inventory, and grow your business with confidence.
          </p>
        </div>

        <div className="space-y-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-orange-100">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">{label}</span>
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
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-11"
                  {...register('email')}
                />
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
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
