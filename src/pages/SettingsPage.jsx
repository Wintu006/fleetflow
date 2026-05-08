import { Settings, User, Building2, Bell, Shield, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gerencie as configurações do sistema</p>
      </div>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Perfil
          </CardTitle>
          <CardDescription>Informações do seu perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.company?.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Empresa</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.company?.name || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Função</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{profile?.role || '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>Gerencie suas preferências de notificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Manutenções</p>
              <p className="text-sm text-gray-500">Receber alertas de manutenções</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Checklists</p>
              <p className="text-sm text-gray-500">Lembretes de inspeção</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Tema dark/light gerenciado automaticamente</p>
        </CardContent>
      </Card>
    </div>
  )
}