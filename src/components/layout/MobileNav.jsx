import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Car,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Settings,
  ClipboardCheck,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Veículos',
    href: '/vehicles',
    icon: Car,
  },
  {
    name: 'Novo Veículo',
    href: '/vehicles/new',
    icon: PlusCircle,
  },
  {
    name: 'Manutenções',
    href: '/maintenance',
    icon: Wrench,
  },
  {
    name: 'Checklists',
    href: '/checklist',
    icon: ClipboardCheck,
  },
  {
    name: 'Análises',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

export function MobileNav({ open, onToggle }) {
  const location = useLocation()

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onToggle}
      />

      {/* Menu lateral */}
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-gray-900 z-50 lg:hidden animate-in slide-in-from-left overflow-y-auto">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-fleet-400 to-fleet-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FleetFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onToggle}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-fleet-600/30 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-fleet-400' : 'text-gray-500'
                )} />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}