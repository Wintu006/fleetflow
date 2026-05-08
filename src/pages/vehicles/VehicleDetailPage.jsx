import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatMileage } from '@/utils/format'
import { Pencil } from 'lucide-react'

const fuelLabels = {
  gasoline: 'Gasolina',
  diesel: 'Diesel',
  flex: 'Flex',
  electric: 'Elétrico',
  hybrid: 'Híbrido',
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicle(id)
      return data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Veículo não encontrado</h2>
        <Button onClick={() => navigate('/vehicles')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        description={`Placa: ${vehicle.plate}`}
        backButton
        action={
          <Button onClick={() => navigate(`/vehicles/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Placa</p>
              <p className="font-mono font-medium text-lg">{vehicle.plate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marca/Modelo</p>
              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ano</p>
              <p className="font-medium">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Combustível</p>
              <p className="font-medium">{fuelLabels[vehicle.fuel_type]}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Dados Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Quilometragem</p>
              <p className="font-medium text-lg">{formatMileage(vehicle.mileage)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={vehicle.status} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de Cadastro</p>
              <p className="font-medium">
                {new Date(vehicle.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}