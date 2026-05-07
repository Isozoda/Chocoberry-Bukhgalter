import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { useUIStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { sidebarOpen } = useUIStore()

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header />
        <main
          className={cn(
            'pt-16 min-h-screen transition-all duration-300',
            sidebarOpen ? 'pl-64' : 'pl-20'
          )}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
