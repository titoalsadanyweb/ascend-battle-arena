
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

      console.log('Fetching dashboard data for user:', user.id)

      try {
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
          const errorText = await response.text()
          console.error('Dashboard fetch error - Status:', response.status, 'Response:', errorText)
          
          // Fallback to profile data if dashboard function fails
          console.log('Dashboard API failed, falling back to profile data')
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('current_streak, best_streak, token_balance, last_check_in_date, timezone')
            .eq('id', user.id)
            .single()

          if (profileError || !profile) {
            throw new Error('Failed to fetch dashboard or profile data')
          }

          // Get recent check-ins
          const { data: checkIns } = await supabase
            .from('check_ins')
            .select('date_local, status, tokens_awarded')
            .eq('user_id', user.id)
            .order('date_local', { ascending: false })
            .limit(30)

          // Calculate if checked in today
          const today = new Date().toLocaleDateString('en-CA', { 
            timeZone: profile.timezone || 'UTC' 
          })
          const hasCheckedInToday = checkIns?.some(c => c.date_local === today) || false

          return {
            current_streak: profile.current_streak,
            best_streak: profile.best_streak,
            token_balance: profile.token_balance,
            has_checked_in_today: hasCheckedInToday,
            check_ins_history: checkIns || []
          }
        }

        const data = await response.json()
        console.log('Dashboard data received:', data)
        return data
      } catch (error) {
        console.error('Dashboard fetch failed, using fallback:', error)
        
        // Fallback to direct profile query
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_streak, best_streak, token_balance, last_check_in_date, timezone')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          throw new Error('Failed to fetch profile data')
        }

        const { data: checkIns } = await supabase
          .from('check_ins')
          .select('date_local, status, tokens_awarded')
          .eq('user_id', user.id)
          .order('date_local', { ascending: false })
          .limit(30)

        const today = new Date().toLocaleDateString('en-CA', { 
          timeZone: profile.timezone || 'UTC' 
        })
        const hasCheckedInToday = checkIns?.some(c => c.date_local === today) || false

        return {
          current_streak: profile.current_streak,
          best_streak: profile.best_streak,
          token_balance: profile.token_balance,
          has_checked_in_today: hasCheckedInToday,
          check_ins_history: checkIns || []
        }
      }
    },
    enabled: !!user && !authLoading,
    staleTime: 10 * 1000, // Very short stale time for quick updates
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized')) return false
      return failureCount < 1
    },
  })

  return {
    dashboardData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
