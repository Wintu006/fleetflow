import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { MobileNav } from './MobileNav'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 antialiased">
      {/* Sidebar para desktop */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Menu mobile */}
      {isMobile && (
        <MobileNav
          open={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      )}

      {/* Conteúdo principal */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          !isMobile && (sidebarCollapsed ? 'ml-20' : 'ml-64'),
          isMobile && 'ml-0'
        )}
      >
        {/* Navbar superior */}
        <TopNavbar
          onMenuClick={() => {
            if (isMobile) {
              setMobileMenuOpen(!mobileMenuOpen)
            } else {
              setSidebarCollapsed(!sidebarCollapsed)
            }
          }}
          showMenuButton={true}
        />

        {/* Área de conteúdo */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}