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

export default function RegisterPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const BENEFITS = t('auth:register.branding.benefits', { returnObjects: true }) as string[]

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      authApi.register({ name: data.name, email: data.email, password: data.password }),
    onSuccess: (data) => {
      login(data.accessToken, data.user)
      toast.success(t('auth:register.success'))
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
            <span className="text-2xl font-display font-semibold">Choco Berry</span>
          </div>
          <h1 className="text-4xl font-display font-semibold mb-4 leading-tight">
            {t('auth:register.branding.title')}
          </h1>
          <p className="text-orange-100 text-lg">
            {t('auth:register.branding.description')}
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
            <h2 className="text-3xl font-display font-semibold text-primary">Choco Berry</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-foreground">{t('auth:register.title')}</h2>
            <p className="text-muted-foreground mt-1">{t('auth:register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">{t('auth:register.nameLabel')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder={t('auth:register.namePlaceholder')} className="pl-10 h-11" {...register('name')} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">{t('auth:register.emailLabel')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder={t('auth:register.emailPlaceholder')} className="pl-10 h-11" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">{t('auth:register.passwordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth:register.passwordPlaceholder')}
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
              <Label htmlFor="confirmPassword" className="text-sm font-medium">{t('auth:register.confirmPasswordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder={t('auth:register.confirmPasswordPlaceholder')}
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
                  {t('auth:register.creatingAccount')}
                </span>
              ) : t('auth:register.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth:register.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t('auth:register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
