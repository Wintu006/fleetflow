import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = 'blue', 
  loading,
  onClick,
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              {Icon && (
                <div className={cn('p-2 rounded-lg border', colorClasses[color])}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </p>
              
              {description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
              
              {trend && (
                <div className="mt-2 flex items-center gap-1">
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {trend.value}% este mês
                  </span>
                </div>
              )}
            </div>

            {/* Barra decorativa inferior */}
            <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full',
                  color === 'blue' && 'bg-blue-500',
                  color === 'green' && 'bg-green-500',
                  color === 'yellow' && 'bg-yellow-500',
                  color === 'red' && 'bg-red-500',
                  color === 'indigo' && 'bg-indigo-500',
                )}
                style={{ width: '60%' }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}