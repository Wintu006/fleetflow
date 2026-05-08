# Executar como: powershell -ExecutionPolicy Bypass -File Criar-Componentes.ps1

Write-Host "🚀 FleetFlow - Criando Componentes" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Criar pastas
$pastas = @(
    "src\components\shared",
    "src\components\forms",
    "src\pages\vehicles",
    "src\utils",
    "src\hooks"
)

foreach ($pasta in $pastas) {
    New-Item -ItemType Directory -Force -Path $pasta | Out-Null
    Write-Host "📁 $pasta" -ForegroundColor Green
}

# 1. LoadingSpinner.jsx
@'
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
'@ | Out-File -FilePath "src/components/shared/LoadingSpinner.jsx" -Encoding UTF8

Write-Host "✅ LoadingSpinner.jsx" -ForegroundColor Yellow

# 2. EmptyState.jsx
@'
import { Car } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({ icon: Icon = Car, title = 'Nenhum item encontrado', description = 'Comece adicionando um novo item.', action, actionLabel }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action} className="mt-4">{actionLabel || 'Criar novo'}</Button>
      )}
    </div>
  )
}
'@ | Out-File -FilePath "src/components/shared/EmptyState.jsx" -Encoding UTF8

Write-Host "✅ EmptyState.jsx" -ForegroundColor Yellow

# 3. PageHeader.jsx
@'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PageHeader({ title, description, action, backButton }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {backButton && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
'@ | Out-File -FilePath "src/components/shared/PageHeader.jsx" -Encoding UTF8

Write-Host "✅ PageHeader.jsx" -ForegroundColor Yellow

# 4. NotFoundPage.jsx
@'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-400">Página não encontrada</h2>
        <p className="mt-2 text-gray-500">A página que você está procurando não existe ou foi movida.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-6">Voltar ao Dashboard</Button>
      </div>
    </div>
  )
}
'@ | Out-File -FilePath "src/pages/NotFoundPage.jsx" -Encoding UTF8

Write-Host "✅ NotFoundPage.jsx" -ForegroundColor Yellow

# 5. format.js
@'
export function formatMileage(km) {
  if (!km && km !== 0) return '0 km'
  return new Intl.NumberFormat('pt-BR').format(km) + ' km'
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}
'@ | Out-File -FilePath "src/utils/format.js" -Encoding UTF8

Write-Host "✅ format.js" -ForegroundColor Yellow

# 6. useMediaQuery.js
@'
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
'@ | Out-File -FilePath "src/hooks/useMediaQuery.js" -Encoding UTF8

Write-Host "✅ useMediaQuery.js" -ForegroundColor Yellow

# 7. StatusBadge.jsx
@'
import { Badge } from '@/components/ui/badge'

const statusLabels = {
  active: 'Ativo',
  maintenance: 'Em Manutenção',
  inactive: 'Inativo',
  sold: 'Vendido',
}

export function StatusBadge({ status }) {
  const variants = {
    active: 'success',
    maintenance: 'warning',
    inactive: 'secondary',
    sold: 'outline',
  }

  return (
    <Badge variant={variants[status] || 'default'}>
      {statusLabels[status] || status}
    </Badge>
  )
}
'@ | Out-File -FilePath "src/components/shared/StatusBadge.jsx" -Encoding UTF8

Write-Host "✅ StatusBadge.jsx" -ForegroundColor Yellow

Write-Host "`n🎉 Componentes essenciais criados com sucesso!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Agora execute: npm run dev" -ForegroundColor Yellow