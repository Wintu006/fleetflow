import { supabase } from './supabaseClient'

export const vehicleService = {
  // Buscar todos os veículos da empresa
  async getVehicles(companyId, options = {}) {
    try {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
      return { data: null, error }
    }
  },

  // Buscar um veículo específico
  async getVehicle(id) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Criar novo veículo
  async createVehicle(vehicleData) {
    try {
      console.log('📤 Criando veículo:', vehicleData)

      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          plate: vehicleData.plate,
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
          fuel_type: vehicleData.fuel_type,
          mileage: vehicleData.mileage,
          status: vehicleData.status || 'active',
          company_id: vehicleData.company_id,
          color: vehicleData.color || null,
          notes: vehicleData.notes || null,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro Supabase:', error)
        throw error
      }

      console.log('✅ Veículo criado:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Erro ao criar veículo:', error.message)
      return { data: null, error }
    }
  },

  // Atualizar veículo
  async updateVehicle(id, updates) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
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
      console.error('Erro ao atualizar veículo:', error)
      return { data: null, error }
    }
  },

  // Soft delete (muda status para 'sold')
  async softDelete(id) {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          status: 'sold',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Erro ao fazer soft delete:', error)
      return { error }
    }
  },

  // Hard delete (remove permanentemente)
  async permanentlyDelete(id) {
    try {
      console.log('🗑️ Excluindo permanentemente:', id)

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao excluir:', error)
        throw error
      }

      console.log('✅ Veículo excluído permanentemente')
      return { error: null }
    } catch (error) {
      console.error('❌ Erro ao excluir veículo:', error.message)
      return { error }
    }
  },

  // Estatísticas da frota
  async getVehicleStats(companyId) {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .neq('status', 'sold')

      if (error) throw error

      const stats = {
        total: vehicles?.length || 0,
        active: vehicles?.filter(v => v.status === 'active').length || 0,
        maintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0,
        avgMileage: vehicles?.length
          ? Math.round(vehicles.reduce((acc, v) => acc + v.mileage, 0) / vehicles.length)
          : 0,
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return { data: null, error }
    }
  },
}