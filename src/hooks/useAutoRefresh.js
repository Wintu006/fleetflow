import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useAutoRefresh(queryKeys) {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidar e refetch quando o componente montar
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
  }, []) // Só executa quando montar
}