import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { maintenanceService } from '@/services/maintenanceService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react'
import { formatCurrency } from '@/utils/format'

const statusConfig = {
  pending: { label: 'Pendente', variant: 'warning', icon: Clock },
  in_progress: { label: 'Em Andamento', variant: 'default', icon: AlertTriangle },
  completed: { label: 'Concluída', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada', variant: 'destructive', icon: XCircle },
}

const typeConfig = {
  preventive: { label: 'Preventiva', color: 'text-blue-400' },
  corrective: { label: 'Corretiva', color: 'text-orange-400' },
  emergency: { label: 'Emergencial', color: 'text-red-400' },
}

export default function MaintenanceListPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Queries
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['maintenance', profile?.company?.id, statusFilter, typeFilter],
    queryFn: async () => {
      const { data } = await maintenanceService.getMaintenanceOrders(
        profile.company.id,
        { status: statusFilter, type: typeFilter, search }
      )
      return data || []
    },
    enabled: !!profile?.company?.id,
  })

  const { data: stats } = useQuery({
    queryKey: ['maintenanceStats', profile?.company?.id],
    queryFn: async () => {
      const { data } = await maintenanceService.getMaintenanceStats(profile.company.id)
      return data
    },
    enabled: !!profile?.company?.id,
  })

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: (id) => maintenanceService.deleteMaintenanceOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] })
    },
  })

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search ||
      o.vehicle?.plate?.toLowerCase().includes(search.toLowerCase()) ||
      o.workshop?.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const statsCards = [
    { label: 'Total', value: stats?.total || 0, icon: Wrench, color: 'blue' },
    { label: 'Pendentes', value: stats?.pending || 0, icon: Clock, color: 'yellow' },
    { label: 'Em Andamento', value: stats?.inProgress || 0, icon: AlertTriangle, color: 'indigo' },
    { label: 'Concluídas', value: stats?.completed || 0, icon: CheckCircle2, color: 'green' },
  ]

  return (
    <div className="animate-fadeIn space-y-6">
      <PageHeader
        title="Manutenções"
        description="Gerencie as ordens de manutenção da frota"
        action={
          <Button onClick={() => navigate('/maintenance/new')} className="bg-fleet-500 hover:bg-fleet-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova Manutenção
          </Button>
        }
      />

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Card key={card.label} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
                </div>
                <card.icon className={`w-8 h-8 text-${card.color}-500`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por veículo, oficina ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="preventive">Preventiva</SelectItem>
                <SelectItem value="corrective">Corretiva</SelectItem>
                <SelectItem value="emergency">Emergencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Nenhuma manutenção encontrada"
              description="Cadastre sua primeira ordem de manutenção"
              action={() => navigate('/maintenance/new')}
              actionLabel="Nova Manutenção"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Veículo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Oficina</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hidden md:table-cell">Data</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hidden md:table-cell">Custo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status]?.icon || Clock
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {order.vehicle?.plate}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.vehicle?.brand} {order.vehicle?.model}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium ${typeConfig[order.type]?.color}`}>
                            {typeConfig[order.type]?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {order.workshop || '—'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                          {new Date(order.entry_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                          {order.cost ? formatCurrency(order.cost) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusConfig[order.status]?.variant || 'default'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[order.status]?.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/maintenance/${order.id}/edit`)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Manutenção</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Veículo</p>
                  <p className="font-medium">{selectedOrder.vehicle?.plate} - {selectedOrder.vehicle?.brand} {selectedOrder.vehicle?.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className={`font-medium ${typeConfig[selectedOrder.type]?.color}`}>{typeConfig[selectedOrder.type]?.label}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge variant={statusConfig[selectedOrder.status]?.variant}>{statusConfig[selectedOrder.status]?.label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Oficina</p>
                  <p className="font-medium">{selectedOrder.workshop || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data Entrada</p>
                  <p className="font-medium">{new Date(selectedOrder.entry_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Previsão Saída</p>
                  <p className="font-medium">{selectedOrder.expected_exit_date ? new Date(selectedOrder.expected_exit_date).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Custo</p>
                  <p className="font-medium text-lg">{selectedOrder.cost ? formatCurrency(selectedOrder.cost) : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Descrição</p>
                <p className="text-sm mt-1">{selectedOrder.description}</p>
              </div>
              {selectedOrder.services_performed && (
                <div>
                  <p className="text-xs text-gray-500">Serviços Realizados</p>
                  <p className="text-sm mt-1">{selectedOrder.services_performed}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}