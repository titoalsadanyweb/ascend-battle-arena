
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'

export interface AllyFeedEvent {
  id: string
  event_type: string
  actor_username: string
  details: string
  timestamp: string
  metadata?: any
}

export const useAllyFeed = () => {
  const { user, loading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['ally-feed', user?.id],
    queryFn: async (): Promise<AllyFeedEvent[]> => {
      if (!user) throw new Error('Not authenticated')
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/ally-feed`,
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
        throw new Error(errorData.error || 'Failed to fetch ally feed')
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
    feedEvents: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
