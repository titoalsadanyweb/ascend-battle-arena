
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'

export interface DashboardData {
  current_streak: number
  best_streak: number
  token_balance: number
  has_checked_in_today: boolean
  check_ins_history: Array<{
    date_local: string
    status: string
    tokens_awarded: number
  }>
}

export const useDashboard = () => {
  const { user, loading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user) throw new Error('Not authenticated')
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/dashboard`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Dashboard fetch failed')
      }

      return response.json()
    },
    enabled: !!user && !authLoading,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized')) return false
      return failureCount < 2
    },
  })

  return {
    dashboardData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
