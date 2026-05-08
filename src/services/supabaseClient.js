import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug
console.log('🔍 Configuração Supabase:')
console.log('URL:', supabaseUrl)
console.log('Key existe:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  console.error('Verifique o arquivo .env na raiz do projeto')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Testar conexão imediatamente
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Erro Supabase:', error.message)
  } else {
    console.log('✅ Supabase conectado com sucesso!')
  }
})