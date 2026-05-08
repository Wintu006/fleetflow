import { supabase } from './supabaseClient'

export const maintenanceService = {
  // Listar manutenções
  async getMaintenanceOrders(companyId, filters = {}) {
    try {
      let query = supabase
        .from('maintenance_orders')
        .select(`
          *,
          vehicle:vehicles(plate, brand, model, year)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId)
      }

      if (filters.search) {
        query = query.or(
          `description.ilike.%${filters.search}%,workshop.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error)
      return { data: null, error }
    }
  },

  // Buscar uma manutenção
  async getMaintenanceOrder(id) {
    try {
      const { data, error } = await supabase
        .from('maintenance_orders')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Criar manutenção
  async createMaintenanceOrder(maintenanceData) {
    try {
      const { data, error } = await supabase
        .from('maintenance_orders')
        .insert(maintenanceData)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao criar manutenção:', error)
      return { data: null, error }
    }
  },

  // Atualizar manutenção
  async updateMaintenanceOrder(id, updates) {
    try {
      const { data, error } = await supabase
        .from('maintenance_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Excluir manutenção
  async deleteMaintenanceOrder(id) {
    try {
      const { error } = await supabase
        .from('maintenance_orders')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Buscar estatísticas
  async getMaintenanceStats(companyId) {
    try {
      const { data: orders, error } = await supabase
        .from('maintenance_orders')
        .select('*')
        .eq('company_id', companyId)

      if (error) throw error

      const stats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        inProgress: orders?.filter(o => o.status === 'in_progress').length || 0,
        completed: orders?.filter(o => o.status === 'completed').length || 0,
        totalCost: orders?.reduce((acc, o) => acc + (o.cost || 0), 0) || 0,
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return { data: null, error }
    }
  },
}