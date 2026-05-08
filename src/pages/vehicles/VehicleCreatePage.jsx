import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
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
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'flex',
    mileage: 0,
    status: 'active',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Verificar se o perfil e company existem
      if (!profile) {
        throw new Error('Perfil não carregado. Faça login novamente.')
      }
      
      if (!profile.company) {
        throw new Error('Empresa não encontrada. Contate o suporte.')
      }
      
      if (!profile.company.id) {
        throw new Error('ID da empresa não encontrado.')
      }

      console.log('📤 Dados do veículo:', {
        ...formData,
        company_id: profile.company.id,
      })

      const { data, error } = await vehicleService.createVehicle({
        ...formData,
        company_id: profile.company.id,
      })

      if (error) throw error

      console.log('✅ Veículo criado:', data)
      alert('Veículo cadastrado com sucesso!')
      navigate('/vehicles')
    } catch (err) {
      console.error('❌ Erro ao cadastrar:', err)
      setError(err.message || 'Erro ao cadastrar veículo')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value,
    })
  }

  return (
    <div>
      <PageHeader
        title="Novo Veículo"
        description="Cadastre um novo veículo na frota"
        backButton
      />

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
              {/* Placa */}
              <div className="space-y-2">
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  name="plate"
                  placeholder="ABC1234"
                  value={formData.plate}
                  onChange={handleChange}
                  className="uppercase"
                  required
                  disabled={loading}
                />
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Ex: FIAT, Toyota, Honda"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="Ex: Uno, Corolla, Civic"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Ano */}
              <div className="space-y-2">
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Combustível */}
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Combustível *</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
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

              {/* Quilometragem */}
              <div className="space-y-2">
                <Label htmlFor="mileage">Quilometragem *</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  min="0"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vehicles')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-fleet-500 to-fleet-600 hover:from-fleet-600 hover:to-fleet-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Veículo'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}