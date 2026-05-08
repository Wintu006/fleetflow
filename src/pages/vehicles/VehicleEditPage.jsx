import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Loader2, Save, Trash2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function VehicleEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Buscar dados do veículo
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicle(id)
      return data
    },
    enabled: !!id,
  })

  // Estado do formulário
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: 2024,
    color: '',
    fuel_type: 'flex',
    mileage: 0,
    status: 'active',
    notes: '',
  })

  // Preencher formulário quando carregar
  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || 2024,
        color: vehicle.color || '',
        fuel_type: vehicle.fuel_type || 'flex',
        mileage: vehicle.mileage || 0,
        status: vehicle.status || 'active',
        notes: vehicle.notes || '',
      })
    }
  }, [vehicle])

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await vehicleService.updateVehicle(id, data)
      if (error) throw error
    },
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
      
      setTimeout(() => {
        navigate('/vehicles')
      }, 1500)
    },
    onError: (err) => {
      setError(err.message || 'Erro ao atualizar veículo')
    },
  })

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await vehicleService.deleteVehicle(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      navigate('/vehicles')
    },
    onError: (err) => {
      setError(err.message || 'Erro ao excluir veículo')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    updateMutation.mutate(formData)
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      deleteMutation.mutate()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value,
    })
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Veículo não encontrado</h2>
        <Button onClick={() => navigate('/vehicles')} className="mt-4">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Editar: ${vehicle.brand} ${vehicle.model}`}
        description={`Placa: ${vehicle.plate}`}
        backButton
        action={
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        }
      />

      {/* Mensagem de sucesso */}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-green-400 text-sm font-medium">
            ✅ Veículo atualizado com sucesso! Redirecionando...
          </p>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  name="plate"
                  value={formData.plate}
                  onChange={handleChange}
                  className="uppercase font-mono"
                  required
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Ex: Prata, Preto, Branco"
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Combustível *</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                    <SelectItem value="electric">Elétrico</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Quilometragem *</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">🟢 Ativo</SelectItem>
                    <SelectItem value="maintenance">🟡 Em Manutenção</SelectItem>
                    <SelectItem value="inactive">⚫ Inativo</SelectItem>
                    <SelectItem value="sold">🔴 Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                placeholder="Notas sobre o veículo..."
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Criado em</p>
                <p className="text-sm font-medium">
                  {new Date(vehicle.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Atualizado em</p>
                <p className="text-sm font-medium">
                  {new Date(vehicle.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vehicles')}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-fleet-500 to-fleet-600 text-white"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}