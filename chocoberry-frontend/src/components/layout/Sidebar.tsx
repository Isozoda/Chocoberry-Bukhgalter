import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Cookie,
  Wallet,
  Users,
  UserCheck,
  Banknote,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Bot,
  Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import logo from '@/assets/image.png'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { inventoryApi } from '@/api/inventory.api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, ns: 'dashboard' as const },
  { path: '/app/sales', icon: ShoppingCart, ns: 'sales' as const },
  { path: '/app/inventory', icon: Package, ns: 'inventory' as const },
  { path: '/app/suppliers', icon: Truck, ns: 'suppliers' as const },
  { path: '/app/products', icon: Cookie, ns: 'products' as const },
  { path: '/app/expenses', icon: Wallet, ns: 'expenses' as const },
  { path: '/app/expenses/fixed', icon: Receipt, ns: 'fixedExpenses' as const },
  { path: '/app/employees', icon: Users, ns: 'employees' as const },
  { path: '/app/attendance', icon: UserCheck, ns: 'attendance' as const },
  { path: '/app/cashbox', icon: Banknote, ns: 'cashbox' as const },
  { path: '/app/accounting', icon: Calculator, ns: 'accounting' as const },
  { path: '/app/daily-report', icon: ClipboardList, ns: 'daily-report' as const },
  { path: '/app/reports', icon: BarChart3, ns: 'reports' as const },
  { path: '/app/ai', icon: Bot, ns: 'ai' as const },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
    refetchInterval: 60000,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out z-40',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 h-20 border-b border-sidebar-border relative group">
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className={cn(
            "relative flex items-center justify-center bg-white rounded-full overflow-hidden transition-all duration-300 shadow-xl",
            sidebarOpen ? "w-12 h-12" : "w-10 h-10"
          )}>
            <img
              src={logo}
              alt="Choco Berry Logo"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
        </div>

        {sidebarOpen && (
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-display font-semibold tracking-tight text-sidebar-foreground truncate">
              Choco Berry
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Business Suite
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-sidebar-hover border border-sidebar-border shadow-xl hover:bg-orange-600 hover:text-white transition-all duration-300 group-hover:scale-110",
            !sidebarOpen && "hidden group-hover:flex"
          )}
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1.5 px-3 custom-scrollbar">
        {navItems.map(({ path, icon: Icon, ns }) => (
          <Tooltip key={path} delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to={path}
                end
                className={({ isActive }) =>
                  cn(
                    'group/item relative flex w-full items-center rounded-xl px-3 py-2.5 transition-all duration-200',
                    isActive
                      ? 'bg-orange-500/10 text-orange-600 shadow-sm'
                      : 'text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <div className="flex flex-row items-center gap-3 w-full" style={{ display: 'flex', flexDirection: 'row' }}>
                    {isActive && (
                      <div className="absolute -left-[3px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.6)]" />
                    )}

                    <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-all duration-300 group-hover/item:scale-110',
                          isActive ? 'text-orange-600' : 'text-muted-foreground group-hover/item:text-sidebar-foreground'
                        )}
                      />
                      {(ns as string) === 'inventory' && lowStockItems.length > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-sidebar bg-destructive" />
                      )}
                    </div>

                    {sidebarOpen && (
                      <span className={cn(
                        "flex-1 truncate text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap",
                        isActive ? "text-orange-600" : "text-muted-foreground group-hover/item:text-sidebar-foreground"
                      )}>
                        {t(`nav.${ns === 'daily-report' ? 'dailyReport' : ns}`)}
                      </span>
                    )}

                    {sidebarOpen && (ns as string) === 'inventory' && lowStockItems.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-4 min-w-[1rem] justify-center rounded-full px-1 text-[9px] font-bold"
                      >
                        {lowStockItems.length}
                      </Badge>
                    )}
                  </div>
                )}
              </NavLink>
            </TooltipTrigger>
            {!sidebarOpen && (
              <TooltipContent side="right" className="bg-popover border-border text-popover-foreground">
                {t(`nav.${ns === 'daily-report' ? 'dailyReport' : ns}`)}
              </TooltipContent>
            )}
          </Tooltip>
        ))}

        {sidebarOpen && (
          <div className="px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            System
          </div>
        )}

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink
              to="/app/business"
              end
              className={({ isActive }) =>
                cn(
                  'group/item relative flex w-full items-center rounded-xl px-3 py-2.5 transition-all duration-200',
                  isActive
                    ? 'bg-orange-500/10 text-orange-600 shadow-sm'
                    : 'text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground'
                )
              }
            >
              {({ isActive }) => (
                <div className="flex flex-row items-center gap-3 w-full" style={{ display: 'flex', flexDirection: 'row' }}>
                  {isActive && (
                    <div className="absolute -left-[3px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.6)]" />
                  )}
                  <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
                    <Settings
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover/item:rotate-90',
                        isActive ? 'text-orange-600' : 'text-muted-foreground group-hover/item:text-sidebar-foreground'
                      )}
                    />
                  </div>
                  {sidebarOpen && (
                    <span className={cn(
                      "flex-1 truncate text-sm font-semibold tracking-tight whitespace-nowrap",
                      isActive ? "text-orange-600" : "text-muted-foreground group-hover/item:text-sidebar-foreground"
                    )}>
                      {t('nav.business')}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          </TooltipTrigger>
          {!sidebarOpen && (
            <TooltipContent side="right" className="bg-popover border-border text-popover-foreground">
              {t('nav.business')}
            </TooltipContent>
          )}
        </Tooltip>
      </nav>

      {/* User area */}
      <div className="mt-auto border-t border-sidebar-border p-4 bg-sidebar/80 backdrop-blur-sm">
        <div className={cn('flex items-center gap-3', !sidebarOpen && 'flex-col')}>
          <div className="relative group/avatar">
            <Avatar className="h-10 w-10 flex-shrink-0 rounded-xl border border-sidebar-border transition-all group-hover/avatar:scale-105">
              <AvatarFallback className="text-sm bg-gradient-to-br from-orange-500 to-rose-600 text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-sidebar rounded-full" />
          </div>

          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">{user?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{user?.role}</p>
            </div>
          )}

          {sidebarOpen ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
