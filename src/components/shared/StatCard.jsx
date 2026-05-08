import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ title, value, description, icon: Icon, trend, color = 'blue', loading }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    indigo: 'bg-indigo-500/10 text-indigo-400',
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              {Icon && (
                <div className={cn('p-2 rounded-lg', colorClasses[color])}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              
              {description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
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
                    trend.isPositive ? 'text-green-500' : 'text-red-500'
                  )}>
                    {trend.value}% este mês
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
