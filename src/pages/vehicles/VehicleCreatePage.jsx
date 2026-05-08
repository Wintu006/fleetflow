import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { supabase } from '@/services/supabaseClient'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertCircle } from 'lucide-react'

export default function VehicleCreatePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'flex',
    mileage: 0,
    status: 'active',
  })

  const getCompanyId = async () => {
    if (profile?.company?.id) return profile.company.id
    if (user?.id) {
      const { data: profileData } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single()
      if (profileData?.company_id) return profileData.company_id
    }
    throw new Error('Empresa não encontrada')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const companyId = await getCompanyId()
      const { error } = await vehicleService.createVehicle({ ...formData, company_id: companyId })
      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicleStats'] })

      navigate('/vehicles')
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar veículo')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value })
  }

  return (
    <div>
      <PageHeader title="Novo Veículo" description="Cadastre um novo veículo na frota" backButton />
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Placa *</Label><Input name="plate" value={formData.plate} onChange={handleChange} placeholder="ABC1234" required disabled={loading} /></div>
              <div className="space-y-2"><Label>Marca *</Label><Input name="brand" value={formData.brand} onChange={handleChange} placeholder="Ex: FIAT" required disabled={loading} /></div>
              <div className="space-y-2"><Label>Modelo *</Label><Input name="model" value={formData.model} onChange={handleChange} placeholder="Ex: Uno" required disabled={loading} /></div>
              <div className="space-y-2"><Label>Ano *</Label><Input name="year" type="number" value={formData.year} onChange={handleChange} required disabled={loading} /></div>
              <div className="space-y-2">
                <Label>Combustível *</Label>
                <Select value={formData.fuel_type} onValueChange={(v) => setFormData({ ...formData, fuel_type: v })} disabled={loading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                    <SelectItem value="electric">Elétrico</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Quilometragem *</Label><Input name="mileage" type="number" value={formData.mileage} onChange={handleChange} required disabled={loading} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })} disabled={loading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => navigate('/vehicles')} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-fleet-500 hover:bg-fleet-600 text-white">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Veículo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}