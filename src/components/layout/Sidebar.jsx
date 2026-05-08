import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Car,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  LogOut,
  PlusCircle,
  ClipboardCheck,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Veículos', href: '/vehicles', icon: Car },
  { name: 'Novo Veículo', href: '/vehicles/new', icon: PlusCircle },
  { name: 'Manutenções', href: '/maintenance', icon: Wrench },
  { name: 'Checklists', href: '/checklist', icon: ClipboardCheck },
  { name: 'Análises', href: '/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { profile, signOut } = useAuth()

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 border-r border-gray-800',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-fleet-400 to-fleet-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-fleet-400 to-blue-200 bg-clip-text text-transparent">
              FleetFlow
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-gray-800/80',
                isActive
                  ? 'bg-gradient-to-r from-fleet-600/30 to-fleet-700/20 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-fleet-400' : 'text-gray-500')} />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-gray-800 px-2 py-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 mb-3">
            <Avatar className="h-8 w-8 border border-gray-700">
              <AvatarFallback className="bg-gradient-to-br from-fleet-500 to-fleet-700 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.company?.name || 'Empresa'}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            'w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-gray-800',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  )
}