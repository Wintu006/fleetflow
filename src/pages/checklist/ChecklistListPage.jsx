import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { checklistService } from '@/services/checklistService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Plus,
  ClipboardCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Clock,
  Car,
  ChevronDown,
  ChevronUp,
  Gauge,
  Lightbulb,
  Droplets,
  FileText,
  SprayCan,
  Wrench,
} from 'lucide-react'

// Mapeamento de ícones por item
const itemIcons = {
  'Pneus': Gauge,
  'Faróis': Lightbulb,
  'Lanternas': Lightbulb,
  'Freios': AlertTriangle,
  'Óleo do Motor': Droplets,
  'Água do Radiador': Droplets,
  'Documentação': FileText,
  'Limpeza Geral': SprayCan,
  'Avarias na Lataria': Wrench,
  'Equipamentos Obrigatórios': Car,
}

const statusColors = {
  ok: { variant: 'success', label: 'OK', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  attention: { variant: 'warning', label: 'Atenção', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  needs_repair: { variant: 'destructive', label: 'Reparo', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
}

export default function ChecklistListPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [expandedCards, setExpandedCards] = useState({})

  // Buscar todos os checklists
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['checklists', profile?.company?.id],
    queryFn: async () => {
      const { data } = await checklistService.getChecklists(profile.company.id)
      return data || []
    },
    enabled: !!profile?.company?.id,
  })

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: (id) => checklistService.deleteChecklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
  })

  // Toggle expandir/recolher itens
  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Checklists de hoje
  const today = new Date().toDateString()
  const todayChecklists = checklists.filter(c => 
    new Date(c.created_at).toDateString() === today
  )

  // Estatísticas
  const stats = {
    total: checklists.length,
    today: todayChecklists.length,
    ok: checklists.filter(c => c.general_status === 'ok').length,
    attention: checklists.filter(c => c.general_status === 'attention').length,
    critical: checklists.filter(c => c.general_status === 'critical').length,
  }

  // Agrupar por data
  const groupedChecklists = checklists.reduce((groups, checklist) => {
    const date = new Date(checklist.created_at).toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long' 
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(checklist)
    return groups
  }, {})

  return (
    <div className="animate-fadeIn space-y-6">
      <PageHeader
        title="Checklists"
        description="Inspeções operacionais dos veículos"
        action={
          <Button onClick={() => navigate('/checklist/new')} className="bg-fleet-500 hover:bg-fleet-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Checklist
          </Button>
        }
      />

      {/* Banner do dia */}
      <div className={`p-5 rounded-xl border-2 ${
        stats.today > 0 
          ? 'bg-green-500/5 border-green-500/30' 
          : 'bg-yellow-500/5 border-yellow-500/30'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              stats.today > 0 ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              <ClipboardCheck className={`w-6 h-6 ${
                stats.today > 0 ? 'text-green-500' : 'text-yellow-500'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.today > 0 
                  ? `✅ ${stats.today} checklist(s) realizado(s) hoje!` 
                  : '⚠️ Nenhum checklist realizado hoje'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.today > 0 
                  ? `${todayChecklists.filter(c => c.general_status === 'ok').length} OK, ${todayChecklists.filter(c => c.general_status !== 'ok').length} com ressalvas`
                  : 'Realize a inspeção diária dos veículos antes da operação'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.ok}</p>
              <p className="text-xs text-gray-500">OK</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.attention}</p>
              <p className="text-xs text-gray-500">Atenção</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
              <p className="text-xs text-gray-500">Crítico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de checklists */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : checklists.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Nenhum checklist encontrado"
              description="Realize a primeira inspeção veicular da frota"
              action={() => navigate('/checklist/new')}
              actionLabel="Novo Checklist"
            />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedChecklists).map(([date, items]) => (
                <div key={date}>
                  {/* Data */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 capitalize">
                      {date}
                    </h3>
                  </div>

                  {/* Grid de cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((checklist) => {
                      const okItems = checklist.items?.filter(i => i.status === 'ok').length || 0
                      const attentionItems = checklist.items?.filter(i => i.status === 'attention').length || 0
                      const repairItems = checklist.items?.filter(i => i.status === 'needs_repair').length || 0
                      const totalItems = checklist.items?.length || 0
                      const okPercentage = totalItems > 0 ? Math.round((okItems / totalItems) * 100) : 0
                      const isExpanded = expandedCards[checklist.id]

                      return (
                        <Card
                          key={checklist.id}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                        >
                          <CardContent className="p-5">
                            {/* Cabeçalho */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  checklist.general_status === 'ok' ? 'bg-green-500/10' :
                                  checklist.general_status === 'attention' ? 'bg-yellow-500/10' :
                                  'bg-red-500/10'
                                }`}>
                                  <Car className={`w-5 h-5 ${
                                    checklist.general_status === 'ok' ? 'text-green-500' :
                                    checklist.general_status === 'attention' ? 'text-yellow-500' :
                                    'text-red-500'
                                  }`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-base text-gray-900 dark:text-gray-100">
                                      {checklist.vehicle?.plate}
                                    </p>
                                    <Badge variant={statusColors[checklist.general_status]?.variant}>
                                      {statusColors[checklist.general_status]?.label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {checklist.vehicle?.brand} {checklist.vehicle?.model} ({checklist.vehicle?.year})
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(checklist.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </div>
                            </div>

                            {/* Barra de progresso */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">
                                  {okItems}/{totalItems} itens OK
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {okPercentage}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    okPercentage >= 80 ? 'bg-green-500' :
                                    okPercentage >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${okPercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Resumo de status */}
                            <div className="flex gap-2 mb-3">
                              {okItems > 0 && (
                                <Badge variant="success" className="text-xs">
                                  ✅ {okItems} OK
                                </Badge>
                              )}
                              {attentionItems > 0 && (
                                <Badge variant="warning" className="text-xs">
                                  ⚠️ {attentionItems} Atenção
                                </Badge>
                              )}
                              {repairItems > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  🔴 {repairItems} Reparo
                                </Badge>
                              )}
                            </div>

                            {/* Botão expandir */}
                            <button
                              onClick={() => toggleExpand(checklist.id)}
                              className="w-full flex items-center justify-center gap-1 py-2 text-sm text-fleet-500 hover:text-fleet-400 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Ocultar itens
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Ver itens inspecionados
                                </>
                              )}
                            </button>

                            {/* Lista de itens (expandida) */}
                            {isExpanded && (
                              <div className="space-y-1.5 mt-2 animate-fadeIn">
                                {checklist.items?.map((item) => {
                                  const ItemIcon = itemIcons[item.item_name] || CheckCircle2
                                  const status = statusColors[item.status]
                                  return (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-900/50"
                                    >
                                      <div className="flex items-center gap-2">
                                        <ItemIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {item.item_name}
                                        </span>
                                        {item.observation && (
                                          <span className="text-xs text-gray-500" title={item.observation}>
                                            💬
                                          </span>
                                        )}
                                      </div>
                                      <Badge variant={status.variant} className="text-xs">
                                        <status.icon className="w-3 h-3 mr-1" />
                                        {status.label}
                                      </Badge>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Ações */}
                            <div className="flex justify-end mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Excluir este checklist?')) {
                                    deleteMutation.mutate(checklist.id)
                                  }
                                }}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}