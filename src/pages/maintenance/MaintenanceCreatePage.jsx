import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { maintenanceService } from '@/services/maintenanceService'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, AlertCircle } from 'lucide-react'

export default function MaintenanceCreatePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    vehicle_id: '', type: 'corrective', status: 'pending',
    description: '', services_performed: '', workshop: '',
    cost: '', mileage: '',
    entry_date: new Date().toISOString().split('T')[0],
    expected_exit_date: '', notes: '',
  })

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.company?.id],
    queryFn: async () => { const { data } = await vehicleService.getVehicles(profile.company.id); return data || [] },
    enabled: !!profile?.company?.id,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!formData.vehicle_id) throw new Error('Selecione um veículo')
      const payload = { ...formData, company_id: profile.company.id, cost: formData.cost ? parseFloat(formData.cost) : 0, mileage: formData.mileage ? parseInt(formData.mileage) : null, expected_exit_date: formData.expected_exit_date || null }
      const { error } = await maintenanceService.createMaintenanceOrder(payload)
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['maintenanceStats'] })
      navigate('/maintenance')
    } catch (err) { setError(err.message || 'Erro ao criar manutenção') }
    finally { setLoading(false) }
  }

  const handleChange = (e) => { const { name, value } = e.target; setFormData({ ...formData, [name]: value }) }

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Nova Manutenção" description="Registre uma ordem de manutenção" backButton />
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-3xl mx-auto">
        <CardContent className="p-6">
          {error && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Veículo *</Label>
                <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
                  <SelectContent>{vehicles.map((v) => (<SelectItem key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model} ({v.year})</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Tipo *</Label><Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="preventive">🔵 Preventiva</SelectItem><SelectItem value="corrective">🟠 Corretiva</SelectItem><SelectItem value="emergency">🔴 Emergencial</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status *</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">🟡 Pendente</SelectItem><SelectItem value="in_progress">🔵 Em Andamento</SelectItem><SelectItem value="completed">🟢 Concluída</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Oficina</Label><Input name="workshop" value={formData.workshop} onChange={handleChange} placeholder="Nome da oficina" /></div>
              <div className="space-y-2"><Label>Custo (R$)</Label><Input name="cost" type="number" step="0.01" value={formData.cost} onChange={handleChange} placeholder="0,00" /></div>
              <div className="space-y-2"><Label>Quilometragem</Label><Input name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="Km atual" /></div>
              <div className="space-y-2"><Label>Data de Entrada *</Label><Input name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label>Previsão de Saída</Label><Input name="expected_exit_date" type="date" value={formData.expected_exit_date} onChange={handleChange} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição do Problema *</Label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Descreva o problema..." /></div>
            <div className="space-y-2"><Label>Serviços Realizados</Label><textarea name="services_performed" value={formData.services_performed} onChange={handleChange} rows={3} className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Serviços que foram realizados..." /></div>
            <div className="space-y-2"><Label>Observações</Label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="Observações adicionais..." /></div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => navigate('/maintenance')}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-fleet-500 hover:bg-fleet-600 text-white">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Manutenção</>}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}