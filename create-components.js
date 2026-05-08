import fs from 'fs';
import path from 'path';

const components = {
  // 1. Loading Spinner
  'src/components/shared/LoadingSpinner.jsx': `
import { cn } from '@/lib/utils'

export function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-fleet-500',
          sizeClasses[size]
        )}
      />
    </div>
  )
}
`,

  // 2. StatCard
  'src/components/shared/StatCard.jsx': `
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ title, value, description, icon: Icon, trend, color = 'blue', loading }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    indigo: 'bg-indigo-500/10 text-indigo-400',
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              {Icon && (
                <div className={cn('p-2 rounded-lg', colorClasses[color])}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </p>
              
              {description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
              
              {trend && (
                <div className="mt-2 flex items-center gap-1">
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-green-500' : 'text-red-500'
                  )}>
                    {trend.value}% este mês
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
`,

  // 3. EmptyState
  'src/components/shared/EmptyState.jsx': `
import { Car } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({ 
  icon: Icon = Car,
  title = 'Nenhum item encontrado',
  description = 'Comece adicionando um novo item.',
  action,
  actionLabel,
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <Button onClick={action} className="mt-4">
          {actionLabel || 'Criar novo'}
        </Button>
      )}
    </div>
  )
}
`,

  // 4. DataTable
  'src/components/shared/DataTable.jsx': `
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'

export function DataTable({ 
  data = [], 
  columns = [], 
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data.length) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-gray-100 dark:border-gray-800/50',
                onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { cn } from '@/lib/utils'
`,

  // 5. StatusBadge
  'src/components/shared/StatusBadge.jsx': `
import { Badge } from '@/components/ui/badge'
import { VEHICLE_STATUS_LABELS } from '@/lib/constants'

export function StatusBadge({ status }) {
  const variants = {
    active: 'success',
    maintenance: 'warning',
    inactive: 'secondary',
    sold: 'outline',
  }

  return (
    <Badge variant={variants[status] || 'default'}>
      {VEHICLE_STATUS_LABELS[status] || status}
    </Badge>
  )
}
`,

  // 6. ConfirmDialog
  'src/components/shared/ConfirmDialog.jsx': `
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirmar ação',
  description = 'Tem certeza que deseja realizar esta ação?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'destructive',
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Carregando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
`,

  // 7. PageHeader
  'src/components/shared/PageHeader.jsx': `
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PageHeader({ title, description, action, backButton }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {backButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
`,

  // 8. VehicleForm
  'src/components/forms/VehicleForm.jsx': `
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vehicleSchema } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { VEHICLE_STATUS_LABELS, FUEL_TYPE_LABELS } from '@/lib/constants'

export function VehicleForm({ onSubmit, loading, initialData }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData || {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      fuel_type: 'flex',
      mileage: 0,
      status: 'active',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placa */}
        <div className="space-y-2">
          <Label htmlFor="plate">Placa *</Label>
          <Input
            id="plate"
            placeholder="ABC1234"
            {...register('plate')}
            error={errors.plate?.message}
          />
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="brand">Marca *</Label>
          <Input
            id="brand"
            placeholder="Toyota"
            {...register('brand')}
            error={errors.brand?.message}
          />
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor="model">Modelo *</Label>
          <Input
            id="model"
            placeholder="Corolla"
            {...register('model')}
            error={errors.model?.message}
          />
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Label htmlFor="year">Ano *</Label>
          <Input
            id="year"
            type="number"
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
          />
        </div>

        {/* Tipo de Combustível */}
        <div className="space-y-2">
          <Label htmlFor="fuel_type">Combustível *</Label>
          <Select
            onValueChange={(value) => setValue('fuel_type', value)}
            defaultValue={watch('fuel_type')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quilometragem */}
        <div className="space-y-2">
          <Label htmlFor="mileage">Quilometragem *</Label>
          <Input
            id="mileage"
            type="number"
            {...register('mileage', { valueAsNumber: true })}
            error={errors.mileage?.message}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) => setValue('status', value)}
            defaultValue={watch('status')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          {...register('notes')}
          placeholder="Observações sobre o veículo..."
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
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
  )
}
`,

  // 9. VehiclesListPage
  'src/pages/vehicles/VehiclesListPage.jsx': `
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Filter } from 'lucide-react'
import { formatMileage } from '@/utils/format'
import { QUERY_KEYS, ROUTES } from '@/lib/constants'

export default function VehiclesListPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, profile?.company?.id],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(profile.company.id)
      return data || []
    },
    enabled: !!profile?.company?.id,
  })

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = !search || 
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    { key: 'plate', label: 'Placa' },
    { key: 'model', label: 'Modelo', render: (_, row) => `${row.brand} ${row.model}` },
    { key: 'year', label: 'Ano' },
    { key: 'mileage', label: 'Km', render: (val) => formatMileage(val) },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
  ]

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Veículos"
        description="Gerencie sua frota de veículos"
        action={
          <Button onClick={() => navigate(ROUTES.VEHICLES_NEW)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        }
      />

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por placa ou modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <DataTable
            data={filteredVehicles}
            columns={columns}
            loading={isLoading}
            emptyMessage="Nenhum veículo cadastrado"
            onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
`,

  // 10. VehicleCreatePage
  'src/pages/vehicles/VehicleCreatePage.jsx': `
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { VehicleForm } from '@/components/forms/VehicleForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ROUTES } from '@/lib/constants'

export default function VehicleCreatePage() {
  const [loading, setLoading] = useState(false)
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (data) => {
    setLoading(true)
    
    try {
      const { error } = await vehicleService.createVehicle({
        ...data,
        company_id: profile.company.id,
      })

      if (error) throw error

      toast({
        title: 'Veículo cadastrado!',
        description: 'O veículo foi adicionado à frota com sucesso.',
        variant: 'success',
      })

      navigate(ROUTES.VEHICLES)
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Novo Veículo"
        description="Cadastre um novo veículo na frota"
        backButton
      />

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <VehicleForm onSubmit={handleSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
`,

  // 11. VehicleDetailPage
  'src/pages/vehicles/VehicleDetailPage.jsx': `
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatMileage } from '@/utils/format'
import { FUEL_TYPE_LABELS, ROUTES } from '@/lib/constants'
import { Pencil, ArrowLeft } from 'lucide-react'

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
        <Button onClick={() => navigate(ROUTES.VEHICLES)} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title={vehicle.plate}
        description={`${vehicle.brand} ${vehicle.model}`}
        backButton
        action={
          <Button onClick={() => navigate(`/vehicles/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Placa</p>
              <p className="font-mono font-medium">{vehicle.plate}</p>
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
              <p className="font-medium">{FUEL_TYPE_LABELS[vehicle.fuel_type]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Quilometragem</p>
              <p className="font-medium">{formatMileage(vehicle.mileage)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={vehicle.status} />
            </div>
            {vehicle.notes && (
              <div>
                <p className="text-sm text-gray-500">Observações</p>
                <p className="text-sm">{vehicle.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`,

  // 12. NotFoundPage
  'src/pages/NotFoundPage.jsx': `
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-400">
          Página não encontrada
        </h2>
        <p className="mt-2 text-gray-500">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="mt-6"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}
`,

  // 13. FormField
  'src/components/forms/FormField.jsx': `
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function FormField({ label, error, children, ...props }) {
  return (
    <div className="space-y-2">
      {label && <Label {...props}>{label}</Label>}
      {children || <Input {...props} />}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
`,

  // 14. Utilitários de formatação
  'src/utils/format.js': `
/**
 * Formata quilometragem para exibição
 */
export function formatMileage(km) {
  if (!km && km !== 0) return '0 km'
  return new Intl.NumberFormat('pt-BR').format(km) + ' km'
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata data
 */
export function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

/**
 * Formata placa de veículo
 */
export function formatPlate(plate) {
  if (!plate) return ''
  const cleaned = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  return cleaned
}
`,

  // 15. Hooks
  'src/hooks/useMediaQuery.js': `
import { useState, useEffect } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    setMatches(media.matches)

    const listener = (event) => setMatches(event.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
`,

  'src/hooks/useVehicles.js': `
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { QUERY_KEYS } from '@/lib/constants'

export function useVehicles() {
  const { profile } = useAuth()
  const companyId = profile?.company?.id

  const { data: vehicles, isLoading: loading } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLES, companyId],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(companyId)
      return data || []
    },
    enabled: !!companyId,
  })

  const { data: stats } = useQuery({
    queryKey: [QUERY_KEYS.VEHICLE_STATS, companyId],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicleStats(companyId)
      return data
    },
    enabled: !!companyId,
  })

  return {
    vehicles,
    stats,
    loading,
  }
}
`,
};

// Criar todos os arquivos
Object.entries(components).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`✅ Criado: ${filePath}`);
});

console.log('\n🎉 Todos os componentes foram criados com sucesso!');