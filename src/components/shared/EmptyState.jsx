import { Car } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({ 
  icon: Icon = Car,
  title = 'Nenhum item encontrado',
  description = 'Comece adicionando um novo item.',
  action,
  actionLabel,
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <Button onClick={action} className="mt-4">
          {actionLabel || 'Criar novo'}
        </Button>
      )}
    </div>
  )
}