import { useTranslation } from 'react-i18next'
import { LogOut, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import logo from '@/assets/image.png'
import enFlag from '@/assets/image copy 3.png'
import ruFlag from '@/assets/image copy 2.png'
import tjFlag from '@/assets/image copy.png'
import POSTerminal from './POSTerminal'

export default function CashierPOSPage() {
  const { t } = useTranslation('sales')
  const { mode, toggle } = useTheme()
  const { changeLanguage, currentLang } = useLanguage()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="fixed top-0 inset-x-0 h-16 bg-card border-b flex items-center px-4 sm:px-6 gap-4 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white overflow-hidden border border-border/50 shadow-sm flex items-center justify-center p-1">
            <img src={logo} alt="Choco Berry" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-bold">Choco Berry</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> POS
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2 gap-2 hover:bg-primary/10 transition-all duration-300 rounded-xl"
              >
                <div className="h-6 w-6 rounded-full overflow-hidden border border-border/50 shadow-sm">
                  <img
                    src={currentLang === 'tj' ? tjFlag : currentLang === 'ru' ? ruFlag : enFlag}
                    alt={currentLang}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline-block">
                  {currentLang === 'tj' ? 'TJ' : currentLang.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] rounded-2xl p-1.5 shadow-xl">
              {[
                { code: 'tj', label: 'Tj', flag: tjFlag },
                { code: 'ru', label: 'Ru', flag: ruFlag },
                { code: 'en', label: 'En', flag: enFlag },
              ].map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code as any)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 mb-0.5 last:mb-0',
                    currentLang === lang.code
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full overflow-hidden border border-border shadow-sm">
                      <img src={lang.flag} alt={lang.label} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-sm font-medium">{lang.label}</span>
                  </div>
                  {currentLang === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9">
            {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block text-sm font-medium max-w-[120px] truncate">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout', { defaultValue: 'Баромад' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* POS content - full width, no sidebar */}
      <main className="pt-16">
        <div className="p-4 sm:p-6" style={{ '--pos-h-offset': '112px' } as React.CSSProperties}>
          <POSTerminal />
        </div>
      </main>
    </div>
  )
}
