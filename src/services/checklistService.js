import { supabase } from './supabaseClient'

export const checklistService = {
  async getChecklists(companyId, filters = {}) {
    try {
      // Buscar checklists
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select(`
          *,
          vehicle:vehicles(plate, brand, model, year)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Buscar itens para cada checklist
      const checklistsWithItems = await Promise.all(
        (checklists || []).map(async (checklist) => {
          const { data: items } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('checklist_id', checklist.id)
            .order('created_at', { ascending: true })

          // Buscar nome do usuário
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

  async getChecklist(id) {
    try {
      const { data: checklist, error } = await supabase
        .from('checklists')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', id)
        .order('created_at', { ascending: true })

      // Buscar nome do usuário
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

      console.log('📤 Inserindo itens:', itemsToInsert)

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('❌ Erro ao criar itens:', itemsError)
        // Rollback: deletar checklist se itens falharem
        await supabase.from('checklists').delete().eq('id', checklist.id)
        throw itemsError
      }

      console.log('✅ Checklist salvo com sucesso!')
      return { data: checklist, error: null }
    } catch (error) {
      console.error('❌ Erro:', error.message || error)
      return { data: null, error: error }
    }
  },

  async deleteChecklist(id) {
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },
}