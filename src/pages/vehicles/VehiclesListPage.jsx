import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { vehicleService } from '@/services/vehicleService'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Eye, Loader2, Save, Trash2 } from 'lucide-react'
import { formatMileage } from '@/utils/format'

export default function VehiclesListPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Estado do modal de edição
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editError, setEditError] = useState('')

  // Buscar veículos
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', profile?.company?.id],
    queryFn: async () => {
      const { data } = await vehicleService.getVehicles(profile.company.id)
      return data || []
    },
    enabled: !!profile?.company?.id,
  })

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await vehicleService.updateVehicle(id, data)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setEditingVehicle(null)
    },
    onError: (err) => {
      setEditError(err.message || 'Erro ao atualizar')
    },
  })

  // Mutation para excluir permanentemente
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await vehicleService.permanentlyDelete(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setEditingVehicle(null)
    },
    onError: (err) => {
      setEditError(err.message || 'Erro ao excluir veículo')
    },
  })

  // Filtrar veículos
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = !search ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Abrir modal de edição
  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle)
    setEditForm({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || '',
      fuel_type: vehicle.fuel_type,
      mileage: vehicle.mileage,
      status: vehicle.status,
      notes: vehicle.notes || '',
    })
    setEditError('')
  }

  // Fechar modal
  const closeEditModal = () => {
    if (!updateMutation.isPending && !deleteMutation.isPending) {
      setEditingVehicle(null)
      setEditError('')
    }
  }

  // Salvar edição
  const handleSaveEdit = (e) => {
    e.preventDefault()
    setEditError('')
    updateMutation.mutate({ id: editingVehicle.id, data: editForm })
  }

  // Atualizar campo do formulário
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({
      ...editForm,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value,
    })
  }

  // Confirmar exclusão
  const handleDelete = () => {
    if (window.confirm(
      '⚠️ ATENÇÃO: Esta ação é irreversível!\n\n' +
      'Tem certeza que deseja EXCLUIR PERMANENTEMENTE este veículo?\n\n' +
      'Placa: ' + editingVehicle.plate + '\n' +
      'Modelo: ' + editingVehicle.brand + ' ' + editingVehicle.model + '\n\n' +
      'Esta ação não pode ser desfeita.'
    )) {
      deleteMutation.mutate(editingVehicle.id)
    }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Veículos"
        description={`${filteredVehicles.length} veículos encontrados`}
        action={
          <Button onClick={() => navigate('/vehicles/new')} className="bg-fleet-500 hover:bg-fleet-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por placa, marca ou modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de veículos */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : filteredVehicles.length === 0 ? (
            <EmptyState
              title="Nenhum veículo encontrado"
              description={search ? 'Tente outros termos de busca' : 'Cadastre seu primeiro veículo'}
              action={!search ? () => navigate('/vehicles/new') : null}
              actionLabel="Cadastrar Veículo"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Marca/Modelo
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Ano
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Km
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-sm text-fleet-600 dark:text-fleet-400">
                          {vehicle.plate}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {vehicle.year}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {formatMileage(vehicle.mileage)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                            title="Ver detalhes"
                            className="h-8 w-8 text-gray-500 hover:text-fleet-500"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(vehicle)}
                            title="Editar"
                            className="h-8 w-8 text-gray-500 hover:text-fleet-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={!!editingVehicle} onOpenChange={closeEditModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Veículo</DialogTitle>
            <DialogDescription>
              {editingVehicle?.brand} {editingVehicle?.model} - {editingVehicle?.plate}
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {editError}
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa *</Label>
                <Input
                  name="plate"
                  value={editForm.plate}
                  onChange={handleEditChange}
                  className="uppercase font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Marca *</Label>
                <Input
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input
                  name="model"
                  value={editForm.model}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ano *</Label>
                <Input
                  name="year"
                  type="number"
                  value={editForm.year}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <Input
                  name="color"
                  value={editForm.color}
                  onChange={handleEditChange}
                  placeholder="Ex: Prata"
                />
              </div>

              <div className="space-y-2">
                <Label>Combustível *</Label>
                <Select
                  value={editForm.fuel_type}
                  onValueChange={(value) => setEditForm({ ...editForm, fuel_type: value })}
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
                <Label>Quilometragem *</Label>
                <Input
                  name="mileage"
                  type="number"
                  value={editForm.mileage}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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

            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleEditChange}
                rows={2}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                placeholder="Notas sobre o veículo..."
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending || updateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Permanentemente
                  </>
                )}
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className="bg-fleet-500 hover:bg-fleet-600 text-white"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}