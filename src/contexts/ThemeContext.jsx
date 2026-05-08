import { createContext, useContext, useEffect, useState } from 'react'

/**
 * Contexto de Tema
 * Gerencia o tema dark/light da aplicação
 */
const ThemeContext = createContext(null)

export function ThemeProvider({ children, defaultTheme = 'dark' }) {
  const [theme, setTheme] = useState(() => {
    // Tentar recuperar tema salvo
    const savedTheme = localStorage.getItem('fleetflow-theme')
    return savedTheme || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remover classes antigas
    root.classList.remove('light', 'dark')
    
    // Adicionar classe do tema atual
    root.classList.add(theme)
    
    // Salvar preferência
    localStorage.setItem('fleetflow-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}