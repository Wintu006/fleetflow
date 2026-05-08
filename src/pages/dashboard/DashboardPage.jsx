import { useQuery } from '@tanstack/react-query'
import { Car, TrendingUp, Wrench, AlertTriangle, DollarSign, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QUERY_KEYS } from '@/lib/constants'
import { formatMileage } from '@/utils/format'

export default function DashboardPage() {
  const { profile } = useAuth()
  const companyId = profile?.company?.id

  // Query para buscar estatísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLE_STATS, companyId],
    queryFn: async () => {
      const { data, error } = await vehicleService.getVehicleStats(companyId)
      if (error) throw error
      return data
    },
    enabled: !!companyId,
  })

  // Query para veículos recentes
  const { data: recentVehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, companyId, 'recent'],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(companyId, {
        limit: 5,
      })
      return data || []
    },
    enabled: !!companyId,
  })

  // Métricas do dashboard
  const metrics = [
    {
      title: 'Total de Veículos',
      value: stats?.total || 0,
      description: 'Frota total',
      icon: Car,
      trend: { value: 12, isPositive: true },
      color: 'blue',
      loading: statsLoading,
    },
    {
      title: 'Em Manutenção',
      value: stats?.maintenance || 0,
      description: 'Veículos parados',
      icon: Wrench,
      trend: { value: 5, isPositive: false },
      color: 'yellow',
      loading: statsLoading,
    },
    {
      title: 'Quilometragem Média',
      value: stats?.avgMileage ? formatMileage(stats.avgMileage) : '0 km',
      description: 'Por veículo',
      icon: TrendingUp,
      color: 'green',
      loading: statsLoading,
    },
    {
      title: 'Veículos Ativos',
      value: stats?.active || 0,
      description: 'Em operação',
      icon: Activity,
      trend: { value: 8, isPositive: true },
      color: 'indigo',
      loading: statsLoading,
    },
  ]

  // Função para pegar a cor do status
  const getStatusConfig = (status) => {
    const configs = {
      active: { variant: 'success', label: 'Ativo' },
      maintenance: { variant: 'warning', label: 'Em Manutenção' },
      inactive: { variant: 'secondary', label: 'Inativo' },
      sold: { variant: 'outline', label: 'Vendido' },
    }
    return configs[status] || { variant: 'default', label: status }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visão geral da sua frota de veículos
          </p>
        </div>
        
        <Badge variant="outline" className="w-fit bg-green-500/10 text-green-400 border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
          Sistema Online
        </Badge>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status da Frota */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Status da Frota
            </CardTitle>
            <CardDescription>
              Distribuição por status operacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Status items */}
              {[
                { label: 'Ativos', value: stats?.active, color: 'bg-green-500', percentage: 60 },
                { label: 'Manutenção', value: stats?.maintenance, color: 'bg-yellow-500', percentage: 25 },
                { label: 'Inativos', value: stats?.total - (stats?.active || 0) - (stats?.maintenance || 0), color: 'bg-gray-500', percentage: 15 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.value || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximas Manutenções */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Manutenções Programadas
            </CardTitle>
            <CardDescription>Próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { plate: 'ABC-1234', type: 'Troca de Óleo', days: 2 },
                { plate: 'DEF-5678', type: 'Revisão Geral', days: 4 },
                { plate: 'GHI-9012', type: 'Alinhamento', days: 6 },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {item.plate}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.type}
                    </p>
                  </div>
                  <Badge variant={item.days <= 3 ? 'destructive' : 'warning'}>
                    {item.days} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Veículos Recentes */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Veículos Recentes
          </CardTitle>
          <CardDescription>
            Últimos veículos adicionados à frota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Placa
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Modelo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ano
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Km
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehiclesLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <div className="animate-pulse">Carregando...</div>
                    </td>
                  </tr>
                ) : recentVehicles?.length ? (
                  recentVehicles.map((vehicle) => {
                    const statusConfig = getStatusConfig(vehicle.status)
                    return (
                      <tr
                        key={vehicle.id}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-sm text-gray-900 dark:text-gray-100">
                            {vehicle.plate}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {vehicle.brand} {vehicle.model}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {vehicle.year}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatMileage(vehicle.mileage)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum veículo cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}