import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { checklistService } from '@/services/checklistService'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Car,
  ClipboardCheck,
  Gauge,
  Lightbulb,
  Droplets,
  FileText,
  SprayCan,
  Wrench,
  ArrowLeft,
} from 'lucide-react'

const checklistItems = [
  { name: 'Pneus', icon: Gauge, description: 'Verificar calibragem e desgaste' },
  { name: 'Faróis', icon: Lightbulb, description: 'Farol alto, baixo e sinalização' },
  { name: 'Lanternas', icon: Lightbulb, description: 'Lanternas traseiras e de freio' },
  { name: 'Freios', icon: AlertTriangle, description: 'Testar freios e pedal' },
  { name: 'Óleo do Motor', icon: Droplets, description: 'Nível e qualidade do óleo' },
  { name: 'Água do Radiador', icon: Droplets, description: 'Nível da água e aditivo' },
  { name: 'Documentação', icon: FileText, description: 'CRLV, CNH e seguro' },
  { name: 'Limpeza Geral', icon: SprayCan, description: 'Limpeza interna e externa' },
  { name: 'Avarias na Lataria', icon: Wrench, description: 'Amassados, riscos e pintura' },
  { name: 'Equipamentos Obrigatórios', icon: Car, description: 'Triângulo, macaco, estepe' },
]

const statusOptions = [
  { 
    value: 'ok', 
    label: 'OK', 
    icon: CheckCircle2, 
    color: 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20',
    activeColor: 'bg-green-500 text-white border-green-500 shadow-lg'
  },
  { 
    value: 'attention', 
    label: 'Atenção', 
    icon: AlertTriangle, 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20',
    activeColor: 'bg-yellow-500 text-white border-yellow-500 shadow-lg'
  },
  { 
    value: 'needs_repair', 
    label: 'Reparo', 
    icon: XCircle, 
    color: 'bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20',
    activeColor: 'bg-red-500 text-white border-red-500 shadow-lg'
  },
]

export default function ChecklistCreatePage() {
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [vehicleId, setVehicleId] = useState('')
  const [observations, setObservations] = useState('')
  const [items, setItems] = useState(
    checklistItems.map(item => ({
      item_name: item.name,
      status: 'ok',
      observation: '',
    }))
  )

  // Buscar veículos ativos
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.company?.id],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(profile.company.id)
      return data || []
    },
    enabled: !!profile?.company?.id,
  })

  const activeVehicles = vehicles.filter(v => v.status === 'active')

  const updateItemStatus = (index, status) => {
    const newItems = [...items]
    newItems[index].status = status
    setItems(newItems)
  }

  const updateItemObservation = (index, observation) => {
    const newItems = [...items]
    newItems[index].observation = observation
    setItems(newItems)
  }

  const calculateOverallStatus = () => {
    if (items.some(i => i.status === 'needs_repair')) return 'critical'
    if (items.some(i => i.status === 'attention')) return 'attention'
    return 'ok'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!vehicleId) {
        throw new Error('Selecione um veículo para realizar o checklist')
      }

      const overallStatus = calculateOverallStatus()

      const { error: submitError } = await checklistService.createChecklist(
        {
          company_id: profile.company.id,
          vehicle_id: vehicleId,
          created_by: user.id,
          observations,
          general_status: overallStatus,
        },
        items
      )

      if (submitError) throw submitError

      // Invalidar TODOS os caches relacionados
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicleStats'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] })

      setSuccess(true)
      
      setTimeout(() => {
        navigate('/checklist')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Erro ao salvar checklist')
    } finally {
      setLoading(false)
    }
  }

  const okCount = items.filter(i => i.status === 'ok').length
  const attentionCount = items.filter(i => i.status === 'attention').length
  const repairCount = items.filter(i => i.status === 'needs_repair').length

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md text-center p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Checklist Salvo!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {repairCount > 0 
              ? `${repairCount} ordem(ns) de manutenção foi(ram) criada(s) automaticamente.` 
              : 'Tudo OK com o veículo!'}
          </p>
          {repairCount > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 mb-4">
              <p className="text-red-600 dark:text-red-400 font-medium text-sm">
                🚗 Levar veículo à oficina para reparo!
              </p>
            </div>
          )}
          <p className="text-sm text-gray-400">Redirecionando...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Novo Checklist"
        description={new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
        backButton
      />

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-3xl mx-auto">
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selecionar veículo */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-fleet-500" />
                <Label className="text-base text-gray-900 dark:text-gray-100">Veículo *</Label>
              </div>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o veículo para inspeção" />
                </SelectTrigger>
                <SelectContent>
                  {activeVehicles.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Nenhum veículo ativo disponível
                    </div>
                  ) : (
                    activeVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-base">
                        <span className="font-mono font-bold">{v.plate}</span>
                        <span className="text-gray-500"> - {v.brand} {v.model} ({v.year})</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Alerta de reparo */}
            {repairCount > 0 && (
              <div className="p-4 rounded-lg bg-red-500/5 border-2 border-red-500/30 flex items-start gap-3 animate-fadeIn">
                <Wrench className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    ⚠️ Atenção: {repairCount} item(ns) precisa(m) de reparo!
                  </p>
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    Ao finalizar, uma ordem de manutenção será criada automaticamente.
                  </p>
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      🚗 Levar o veículo à oficina para reparo!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resumo rápido */}
            {vehicleId && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{okCount}</p>
                  <p className="text-xs text-gray-500">✅ OK</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{attentionCount}</p>
                  <p className="text-xs text-gray-500">⚠️ Atenção</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{repairCount}</p>
                  <p className="text-xs text-gray-500">🔴 Reparo</p>
                </div>
              </div>
            )}

            {/* Itens do checklist */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-fleet-500" />
                <Label className="text-base text-gray-900 dark:text-gray-100">Itens de Inspeção</Label>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const itemConfig = checklistItems[index]
                  const ItemIcon = itemConfig.icon
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${
                        vehicleId 
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                          : 'bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60'
                      } ${
                        item.status === 'needs_repair' 
                          ? 'border-l-4 border-l-red-500' 
                          : item.status === 'attention'
                          ? 'border-l-4 border-l-yellow-500'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <ItemIcon className={`w-5 h-5 flex-shrink-0 ${
                            item.status === 'needs_repair' ? 'text-red-500' :
                            item.status === 'attention' ? 'text-yellow-500' :
                            'text-gray-500'
                          }`} />
                          <div>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {item.item_name}
                            </span>
                            <p className="text-xs text-gray-500">
                              {itemConfig.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {statusOptions.map((status) => (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() => vehicleId && updateItemStatus(index, status.value)}
                              disabled={!vehicleId}
                              className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                item.status === status.value
                                  ? status.activeColor
                                  : status.color
                              } ${!vehicleId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                              {item.status === status.value && <status.icon className="w-3 h-3 inline mr-1" />}
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {item.status !== 'ok' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder={`Descreva o problema em "${item.item_name}"...`}
                            value={item.observation}
                            onChange={(e) => updateItemObservation(index, e.target.value)}
                            disabled={!vehicleId}
                            className={`w-full text-xs px-3 py-1.5 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              item.status === 'needs_repair' 
                                ? 'border-red-300 dark:border-red-700 focus:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status geral */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status Geral:
              </span>
              <Badge 
                variant={
                  calculateOverallStatus() === 'ok' ? 'success' : 
                  calculateOverallStatus() === 'attention' ? 'warning' : 
                  'destructive'
                }
                className="text-sm px-4 py-1.5"
              >
                {calculateOverallStatus() === 'ok' ? '✅ Tudo OK' :
                 calculateOverallStatus() === 'attention' ? '⚠️ Atenção Necessária' :
                 '🔴 Precisa de Reparos'}
              </Badge>
            </div>

            {/* Observações gerais */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-900 dark:text-gray-100">Observações Gerais</Label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                disabled={!vehicleId}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50"
                placeholder="Adicione observações sobre a inspeção geral..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/checklist')}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !vehicleId}
                className="bg-fleet-500 hover:bg-fleet-600 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Finalizar Checklist
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}