import { supabase } from './supabaseClient'

export const authService = {
  async signIn(email, password) {
    try {
      console.log('🔐 Tentando login:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Erro no login:', error)
        throw error
      }

      console.log('✅ Login bem sucedido:', data.user?.id)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Exceção no login:', error.message)
      return { data: null, error }
    }
  },

  async signUp(email, password, userData) {
    try {
      console.log('📝 Tentando registrar:', email)
      
      // 1. Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      })

      if (authError) {
        console.error('❌ Erro auth:', authError)
        throw authError
      }
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário')
      }

      console.log('✅ Usuário auth criado:', authData.user.id)

      // 2. Criar empresa
      console.log('🏢 Criando empresa:', userData.companyName)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: userData.companyName,
          email: email,
        })
        .select()
        .single()

      if (companyError) {
        console.error('❌ Erro empresa:', companyError)
        throw companyError
      }

      console.log('✅ Empresa criada:', companyData.id)

      // 3. Criar perfil
      console.log('👤 Criando perfil...')
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          company_id: companyData.id,
          full_name: userData.fullName,
          role: 'admin',
        })

      if (profileError) {
        console.error('❌ Erro perfil:', profileError)
        throw profileError
      }

      console.log('✅ Perfil criado com sucesso!')
      
      return {
        data: { user: authData.user, company: companyData },
        error: null,
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error.message)
      return { data: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      return { error }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  async getUserProfile(userId) {
    try {
      console.log('🔍 Buscando perfil:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        throw error
      }

      console.log('✅ Perfil encontrado:', data)
      return { profile: data, error: null }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error.message)
      return { profile: null, error }
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event)
      callback(event, session)
    })
  },
}