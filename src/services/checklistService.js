import { supabase } from './supabaseClient'

export const checklistService = {
  // Buscar todos os checklists
  async getChecklists(companyId, filters = {}) {
    try {
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select(`
          *,
          vehicle:vehicles(plate, brand, model, year)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const checklistsWithItems = await Promise.all(
        (checklists || []).map(async (checklist) => {
          const { data: items } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('checklist_id', checklist.id)
            .order('created_at', { ascending: true })

          const { data: userData } = await supabase
            .rpc('get_user_name', { user_id: checklist.created_by })

          return {
            ...checklist,
            items: items || [],
            created_by_user: { full_name: userData || 'Usuário' },
          }
        })
      )

      return { data: checklistsWithItems, error: null }
    } catch (error) {
      console.error('Erro ao buscar checklists:', error)
      return { data: [], error }
    }
  },

  // Buscar um checklist específico
  async getChecklist(id) {
    try {
      const { data: checklist, error } = await supabase
        .from('checklists')
        .select(`*, vehicle:vehicles(*)`)
        .eq('id', id)
        .single()

      if (error) throw error

      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', id)
        .order('created_at', { ascending: true })

      const { data: userData } = await supabase
        .rpc('get_user_name', { user_id: checklist.created_by })

      return {
        data: {
          ...checklist,
          items: items || [],
          created_by_user: { full_name: userData || 'Usuário' },
        },
        error: null,
      }
    } catch (error) {
      console.error('Erro ao buscar checklist:', error)
      return { data: null, error }
    }
  },

  // Criar checklist com itens
  async createChecklist(checklistData, items) {
    try {
      console.log('📝 Criando checklist:', checklistData)

      // 1. Criar o checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .insert({
          company_id: checklistData.company_id,
          vehicle_id: checklistData.vehicle_id,
          created_by: checklistData.created_by,
          observations: checklistData.observations || null,
          general_status: checklistData.general_status || 'ok',
        })
        .select()
        .single()

      if (checklistError) {
        console.error('❌ Erro ao criar checklist:', checklistError)
        throw checklistError
      }

      console.log('✅ Checklist criado:', checklist.id)

      // 2. Criar os itens
      const itemsToInsert = items.map(item => ({
        checklist_id: checklist.id,
        item_name: item.item_name,
        status: item.status,
        observation: item.observation || null,
      }))

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('❌ Erro ao criar itens:', itemsError)
        await supabase.from('checklists').delete().eq('id', checklist.id)
        throw itemsError
      }

      console.log('✅ Itens criados:', itemsToInsert.length)

      // 3. NOVO: Criar manutenções automáticas para itens com "precisa reparo"
      const repairItems = items.filter(item => item.status === 'needs_repair')
      
      if (repairItems.length > 0) {
        console.log('🔧 Criando manutenções automáticas para itens com reparo:', repairItems.length)
        
        // Buscar informações do veículo
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('plate, brand, model, mileage')
          .eq('id', checklistData.vehicle_id)
          .single()

        const maintenanceOrders = []

        // Criar uma ordem de manutenção para cada item com problema
        for (const item of repairItems) {
          const fullDescription = [
            `🚨 VEÍCULO PRECISA DE REPARO - ITEM DO CHECKLIST`,
            ``,
            `Veículo: ${vehicle?.plate} - ${vehicle?.brand} ${vehicle?.model}`,
            `Item identificado: ${item.item_name}`,
            `Observação do inspetor: ${item.observation || 'Necessita reparo'}`,
            ``,
            `⚠️ AVISO: Levar o veículo à oficina para reparo imediato!`,
            ``,
            `Checklist realizado em: ${new Date().toLocaleDateString('pt-BR')}`,
            `Checklist ID: #${checklist.id.substring(0, 8)}`,
          ].join('\n')

          const maintenanceOrder = {
            company_id: checklistData.company_id,
            vehicle_id: checklistData.vehicle_id,
            type: 'corrective',
            status: 'pending',
            description: fullDescription,
            services_performed: null,
            workshop: null,
            cost: 0,
            mileage: vehicle?.mileage || null,
            entry_date: new Date().toISOString().split('T')[0],
            expected_exit_date: null,
            notes: `Gerado automaticamente pelo checklist #${checklist.id.substring(0, 8)} - Item: ${item.item_name}`,
          }

          const { data: order, error: maintenanceError } = await supabase
            .from('maintenance_orders')
            .insert(maintenanceOrder)
            .select()
            .single()

          if (maintenanceError) {
            console.error('❌ Erro ao criar manutenção para:', item.item_name, maintenanceError)
          } else {
            console.log('✅ Manutenção criada:', order?.id)
            maintenanceOrders.push(order)
          }
        }

        // Atualizar status do veículo para "maintenance"
        const { error: vehicleUpdateError } = await supabase
          .from('vehicles')
          .update({ 
            status: 'maintenance', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', checklistData.vehicle_id)

        if (vehicleUpdateError) {
          console.error('❌ Erro ao atualizar status do veículo:', vehicleUpdateError)
        } else {
          console.log('🔧 Veículo marcado como "Em Manutenção"')
        }

        console.log(`✅ ${maintenanceOrders.length} ordens de manutenção criadas`)
      }

      console.log('✅ Checklist salvo com sucesso!')
      return { data: checklist, error: null }
    } catch (error) {
      console.error('❌ Erro ao criar checklist:', error.message || error)
      return { data: null, error: error }
    }
  },

  // Excluir checklist
  async deleteChecklist(id) {
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Erro ao excluir checklist:', error)
      return { error }
    }
  },

  // Buscar último checklist do veículo
  async getLastVehicleChecklist(vehicleId) {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`*, items:checklist_items(*)`)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },
}