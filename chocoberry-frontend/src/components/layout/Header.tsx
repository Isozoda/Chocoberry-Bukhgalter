import { useTranslation } from 'react-i18next'
import { useLocation, Link } from 'react-router-dom'
import { Sun, Moon, Bell, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory.api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'

const routeLabels: Record<string, string> = {
  dashboard: 'nav.dashboard',
  sales: 'nav.sales',
  inventory: 'nav.inventory',
  suppliers: 'nav.suppliers',
  products: 'nav.products',
  expenses: 'nav.expenses',
  employees: 'nav.employees',
  cashbox: 'nav.cashbox',
  funds: 'nav.funds',
  reports: 'nav.reports',
  business: 'nav.business',
  'daily-report': 'nav.dailyReport',
}

export function Header() {
  const { t } = useTranslation()
  const { mode, toggle } = useTheme()
  const { changeLanguage, currentLang } = useLanguage()
  const location = useLocation()
  const { sidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: lowStock = [] } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  })

  const segments = location.pathname.split('/').filter(Boolean).slice(1)
  const breadcrumbs = segments.map((seg) => ({
    label: t(routeLabels[seg] || seg),
    path: `/app/${seg}`,
  }))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-card border-b flex items-center px-4 gap-4 z-30 transition-all duration-300',
        sidebarOpen ? 'left-60' : 'left-16'
      )}
    >
      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            <Link
              to={crumb.path}
              className={cn(
                'hover:text-foreground transition-colors',
                i === breadcrumbs.length - 1 && 'text-foreground font-medium'
              )}
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div className="flex rounded-md border overflow-hidden">
          {(['tg', 'ru', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={cn(
                'px-2 py-1 text-xs font-medium transition-colors',
                currentLang === lang
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9">
          {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          {lowStock.length > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
              {lowStock.length > 9 ? '9+' : lowStock.length}
            </span>
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/app/business')}>
              {t('nav.business')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
