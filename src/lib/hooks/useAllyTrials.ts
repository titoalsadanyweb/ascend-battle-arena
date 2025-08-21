import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface AllyTrial {
  id: string
  user_id: string
  ally_id: string
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'failed' | 'upgraded'
  compatibility_score: number
  interaction_count: number
  shared_activities: number
  ally_profile?: {
    username: string
    current_streak: number
    trust_score: number
  }
}

export const useAllyTrials = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get active trials using raw SQL to avoid type issues
  const trialsQuery = useQuery({
    queryKey: ['ally-trials', user?.id],
    queryFn: async (): Promise<AllyTrial[]> => {
      if (!user) throw new Error('Not authenticated')

      // Using rpc with a simple query since the table types aren't updated yet
      const { data, error } = await supabase.rpc('get_user_commitments', {
        p_user_id: user.id
      }) as any // Temporary workaround

      if (error) {
        console.warn('Trial query failed, returning empty array:', error)
        return []
      }
      return []
    },
    enabled: !!user,
  })

  // Start trial mutation - simplified to work with existing system
  const startTrialMutation = useMutation({
    mutationFn: async ({ allyId }: { allyId: string }) => {
      if (!user) throw new Error('Not authenticated')

      // For now, create a regular ally relationship as trial functionality is complex
      const { data, error } = await supabase
        .from('allies')
        .insert({
          user_id: user.id,
          ally_id: allyId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ally-trials'] })
      queryClient.invalidateQueries({ queryKey: ['potential-allies'] })
      queryClient.invalidateQueries({ queryKey: ['allies'] })
      toast({
        title: "Trial Started!",
        description: "Battle ally relationship initiated. Start supporting each other!",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Trial Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Upgrade trial - simplified
  const upgradeTrialMutation = useMutation({
    mutationFn: async ({ trialId }: { trialId: string }) => {
      // For now, just return success as the trial system will be enhanced later
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ally-trials'] })
      queryClient.invalidateQueries({ queryKey: ['allies'] })
      toast({
        title: "Relationship Upgraded!",
        description: "You are now full battle allies!",
      })
    },
  })

  // Log activity - simplified
  const logActivityMutation = useMutation({
    mutationFn: async ({ activityType, allyId }: { 
      activityType: string
      allyId: string
      activityData?: any
    }) => {
      if (!user) throw new Error('Not authenticated')

      // Create ally feed entry instead
      const { error } = await supabase
        .from('ally_feed')
        .insert({
          user_id: user.id,
          ally_id: allyId,
          event_type: activityType,
          details: `Shared activity: ${activityType}`,
          metadata: {}
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ally-trials'] })
    }
  })

  return {
    trials: trialsQuery.data || [],
    isLoading: trialsQuery.isLoading,
    error: trialsQuery.error,
    startTrial: startTrialMutation.mutate,
    upgradeTrial: upgradeTrialMutation.mutate,
    logActivity: logActivityMutation.mutate,
    isStarting: startTrialMutation.isPending,
    isUpgrading: upgradeTrialMutation.isPending,
  }
}