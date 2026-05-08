import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { maintenanceService } from '@/services/maintenanceService'
import { checklistService } from '@/services/checklistService'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatMileage, formatCurrency } from '@/utils/format'
import {
  Car,
  Wrench,
  TrendingUp,
  ClipboardCheck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const companyId = profile?.company?.id

  // Buscar estatísticas de veículos
  const { data: vehicleStats, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicleStats', companyId],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicleStats(companyId)
      return data
    },
    enabled: !!companyId,
  })

  // Buscar estatísticas de manutenção
  const { data: maintenanceStats, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenanceStats', companyId],
    queryFn: async () => {
      const { data } = await maintenanceService.getMaintenanceStats(companyId)
      return data
    },
    enabled: !!companyId,
  })

  // Buscar veículos
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', companyId, 'dashboard'],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(companyId, { limit: 5 })
      return data || []
    },
    enabled: !!companyId,
  })

  // Buscar checklists
  const { data: checklists = [] } = useQuery({
    queryKey: ['checklists', companyId, 'dashboard'],
    queryFn: async () => {
      const { data } = await checklistService.getChecklists(companyId)
      return data || []
    },
    enabled: !!companyId,
  })

  // Buscar manutenções recentes
  const { data: recentMaintenance = [] } = useQuery({
    queryKey: ['maintenance', companyId, 'recent'],
    queryFn: async () => {
      const { data } = await maintenanceService.getMaintenanceOrders(companyId)
      return (data || []).slice(0, 5)
    },
    enabled: !!companyId,
  })

  // Checklists de hoje
  const today = new Date().toDateString()
  const todayChecklists = checklists.filter(c => 
    new Date(c.created_at).toDateString() === today
  )

  // Manutenções pendentes (incluindo as geradas pelo checklist)
  const pendingMaintenance = recentMaintenance.filter(m => 
    m.status === 'pending' || m.status === 'in_progress'
  )
  
  const checklistMaintenance = pendingMaintenance.filter(m => 
    m.description?.includes('[CHECKLIST]')
  )

  // Métricas
  const metrics = [
    {
      title: 'Total de Veículos',
      value: vehicleStats?.total || 0,
      description: `${vehicleStats?.active || 0} ativos`,
      icon: Car,
      color: 'blue',
      loading: vehiclesLoading,
    },
    {
      title: 'Em Manutenção',
      value: maintenanceStats?.inProgress || 0,
      description: `${maintenanceStats?.pending || 0} pendentes`,
      icon: Wrench,
      color: maintenanceStats?.pending > 0 ? 'red' : 'yellow',
      loading: maintenanceLoading,
      onClick: () => navigate('/maintenance'),
    },
    {
      title: 'Quilometragem Média',
      value: vehicleStats?.avgMileage ? formatMileage(vehicleStats.avgMileage) : '0 km',
      description: 'Por veículo',
      icon: TrendingUp,
      color: 'green',
      loading: vehiclesLoading,
    },
    {
      title: 'Custo Manutenções',
      value: maintenanceStats?.totalCost ? formatCurrency(maintenanceStats.totalCost) : 'R$ 0',
      description: 'Total gasto',
      icon: DollarSign,
      color: 'indigo',
      loading: maintenanceLoading,
    },
    {
      title: 'Checklists Hoje',
      value: todayChecklists.length,
      description: todayChecklists.length > 0 
        ? `${todayChecklists.filter(c => c.general_status === 'ok').length} OK` 
        : 'Nenhum hoje',
      icon: ClipboardCheck,
      color: todayChecklists.length > 0 ? 'green' : 'yellow',
      loading: false,
      onClick: () => navigate('/checklist'),
    },
    {
      title: 'Manutenções Concluídas',
      value: maintenanceStats?.completed || 0,
      description: 'Total',
      icon: CheckCircle2,
      color: 'green',
      loading: maintenanceLoading,
    },
  ]

  const statusCounts = {
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length,
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visão geral da sua frota • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Badge variant="success" className="w-fit">
          <Activity className="w-3 h-3 mr-2" />
          Sistema Online
        </Badge>
      </div>

      {/* ALERTA: Manutenções pendentes do checklist */}
      {checklistMaintenance.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/5 border-2 border-red-500/30 flex items-center gap-4 animate-fadeIn">
          <div className="p-3 bg-red-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-600 dark:text-red-400">
              🚨 {checklistMaintenance.length} veículo(s) precisa(m) de reparo!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Itens do checklist foram marcados como "Precisa Reparo". 
              Ordens de manutenção foram criadas automaticamente.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {checklistMaintenance.map((m) => (
                <Badge key={m.id} variant="destructive" className="text-xs">
                  🚗 {m.vehicle?.plate} - Levar à oficina
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            onClick={() => navigate('/maintenance')} 
            variant="outline"
            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Ver Manutenções
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            onClick={metric.onClick}
            className={metric.onClick ? 'cursor-pointer' : ''}
          >
            <StatCard {...metric} />
          </div>
        ))}
      </div>

      {/* Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status da Frota */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Car className="w-5 h-5 text-fleet-500" />
              Status da Frota
            </CardTitle>
            <CardDescription>Distribuição por status operacional</CardDescription>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum veículo cadastrado</p>
                <button
                  onClick={() => navigate('/vehicles/new')}
                  className="text-fleet-500 hover:underline text-sm mt-2"
                >
                  Cadastrar primeiro veículo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Ativos', value: statusCounts.active, color: 'bg-green-500', total: vehicles.length },
                  { label: 'Manutenção', value: statusCounts.maintenance, color: 'bg-yellow-500', total: vehicles.length },
                  { label: 'Inativos', value: statusCounts.inactive, color: 'bg-gray-500', total: vehicles.length },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.value} veículos
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Veículos Recentes
                  </h4>
                  <div className="space-y-2">
                    {vehicles.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        onClick={() => navigate(`/vehicles/${v.id}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{v.plate}</p>
                          <p className="text-xs text-gray-500">{v.brand} {v.model} ({v.year})</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatMileage(v.mileage)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar direita */}
        <div className="space-y-6">
          {/* Manutenções Pendentes */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="cursor-pointer" onClick={() => navigate('/maintenance')}>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Manutenções Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <LoadingSpinner size="sm" className="py-4" />
              ) : pendingMaintenance.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  ✅ Nenhuma manutenção pendente
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingMaintenance.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => navigate(`/maintenance/${m.id}/edit`)}
                      className={`p-3 rounded-lg cursor-pointer hover:shadow transition-all ${
                        m.description?.includes('[CHECKLIST]')
                          ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                          : 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{m.vehicle?.plate}</p>
                        {m.description?.includes('[CHECKLIST]') && (
                          <Badge variant="destructive" className="text-xs">📋 Checklist</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {m.description?.replace('[CHECKLIST]', '').substring(0, 60)}...
                      </p>
                      {m.description?.includes('[CHECKLIST]') && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          🚗 Levar à oficina!
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklists de Hoje */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="cursor-pointer" onClick={() => navigate('/checklist')}>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="w-4 h-4 text-fleet-500" />
                Checklists de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayChecklists.length === 0 ? (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-gray-500">Nenhum checklist hoje</p>
                  <button
                    onClick={() => navigate('/checklist/new')}
                    className="text-fleet-500 hover:underline text-xs mt-1"
                  >
                    Realizar agora
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayChecklists.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium text-sm">{c.vehicle?.plate}</p>
                        <p className="text-xs text-gray-500">
                          {c.items?.filter(i => i.status === 'ok').length || 0}/{c.items?.length || 0} itens OK
                        </p>
                      </div>
                      <Badge variant={c.general_status === 'ok' ? 'success' : 'warning'}>
                        {c.general_status === 'ok' ? 'OK' : 'Atenção'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custo Total */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Custo Total em Manutenções</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {maintenanceStats?.totalCost ? formatCurrency(maintenanceStats.totalCost) : 'R$ 0,00'}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}