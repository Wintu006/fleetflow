import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { maintenanceService } from '@/services/maintenanceService'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Loader2, Save, Trash2, AlertCircle } from 'lucide-react'

export default function MaintenanceEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    vehicle_id: '',
    type: 'corrective',
    status: 'pending',
    description: '',
    services_performed: '',
    workshop: '',
    cost: '',
    mileage: '',
    entry_date: '',
    expected_exit_date: '',
    notes: '',
  })

  // Buscar manutenção
  const { data: order, isLoading } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      const { data } = await maintenanceService.getMaintenanceOrder(id)
      return data
    },
    enabled: !!id,
  })

  // Buscar veículos
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.company?.id],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(profile.company.id)
      return data || []
    },
    enabled: !!profile?.company?.id,
  })

  // Preencher formulário
  useEffect(() => {
    if (order) {
      setFormData({
        vehicle_id: order.vehicle_id || '',
        type: order.type || 'corrective',
        status: order.status || 'pending',
        description: order.description || '',
        services_performed: order.services_performed || '',
        workshop: order.workshop || '',
        cost: order.cost || '',
        mileage: order.mileage || '',
        entry_date: order.entry_date || '',
        expected_exit_date: order.expected_exit_date || '',
        notes: order.notes || '',
      })
    }
  }, [order])

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await maintenanceService.updateMaintenanceOrder(id, data)
      if (error) throw error
    },
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      setTimeout(() => navigate('/maintenance'), 1500)
    },
    onError: (err) => {
      setError(err.message || 'Erro ao atualizar')
    },
  })

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await maintenanceService.deleteMaintenanceOrder(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      navigate('/maintenance')
    },
    onError: (err) => {
      setError(err.message || 'Erro ao excluir')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const payload = {
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      mileage: formData.mileage ? parseInt(formData.mileage) : null,
      expected_exit_date: formData.expected_exit_date || null,
    }
    
    updateMutation.mutate(payload)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDelete = () => {
    if (confirm('Excluir esta manutenção?')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="py-12" />
  if (!order) return <div className="text-center py-12">Manutenção não encontrada</div>

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Editar Manutenção"
        description={`${order.vehicle?.plate} - ${order.vehicle?.brand} ${order.vehicle?.model}`}
        backButton
      />

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-3xl mx-auto">
        <CardContent className="p-6">
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm">✅ Atualizado com sucesso!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Veículo *</Label>
                <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="emergency">Emergencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Oficina</Label>
                <Input name="workshop" value={formData.workshop} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Custo (R$)</Label>
                <Input name="cost" type="number" step="0.01" value={formData.cost} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Quilometragem</Label>
                <Input name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Data Entrada *</Label>
                <Input name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Previsão Saída</Label>
                <Input name="expected_exit_date" type="date" value={formData.expected_exit_date} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>

            <div className="space-y-2">
              <Label>Serviços Realizados</Label>
              <textarea name="services_performed" value={formData.services_performed} onChange={handleChange} rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/maintenance')}>Cancelar</Button>
                <Button type="submit" disabled={updateMutation.isPending} className="bg-fleet-500 text-white">
                  {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}