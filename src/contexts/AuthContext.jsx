import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      if (session?.user) {
        console.log('👤 User logado:', session.user.id)
        setUser(session.user)
        setSession(session)
        
        // Buscar perfil primeiro
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            console.log('📋 Perfil:', profileData)
            
            if (profileData?.company_id) {
              // Buscar empresa
              return supabase
                .from('companies')
                .select('*')
                .eq('id', profileData.company_id)
                .single()
                .then(({ data: companyData }) => {
                  console.log('🏢 Empresa:', companyData)
                  
                  const fullProfile = {
                    ...profileData,
                    company: companyData || { id: profileData.company_id, name: 'Empresa' }
                  }
                  
                  console.log('✅ Profile completo:', fullProfile)
                  if (mounted) setProfile(fullProfile)
                })
            }
          })
          .catch(err => console.error('❌ Erro:', err))
          .finally(() => {
            if (mounted) setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          setSession(session)
        } else {
          setUser(null)
          setSession(null)
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { success: true }
  }

  const signUp = async (email, password, userData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: userData.fullName } },
    })
    if (authError) throw authError

    const { data: companyData } = await supabase
      .from('companies')
      .insert({ name: userData.companyName, email })
      .select()
      .single()

    await supabase.from('profiles').insert({
      user_id: authData.user.id,
      company_id: companyData.id,
      full_name: userData.fullName,
      role: 'admin',
    })

    return { success: true }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      isAuthenticated: !!user,
      signIn, signUp, signOut,
      refreshProfile: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}