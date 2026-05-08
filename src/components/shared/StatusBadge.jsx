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