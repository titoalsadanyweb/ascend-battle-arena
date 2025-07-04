import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface Commitment {
  id: string
  user_id: string
  ally_id: string | null
  start_date: string
  end_date: string
  duration_days: number
  stake_amount: number
  matched_stake_amount: number
  status: 'pending' | 'active' | 'succeeded' | 'failed' | 'cancelled'
  created_at: string
  description?: string
  failure_count: number
  success_streak: number
}

export interface RegroupMission {
  id: string
  user_id: string
  quest_id: string
  date_local: string
  submission_text: string | null
  tokens_awarded: number
  completed_at: string | null
}

interface CreateCommitmentResponse {
  id?: string
  message?: string
  error?: string
}

interface CompleteRegroupResponse {
  success?: boolean
  recovery_tokens?: number
  message?: string
  error?: string
}

export const useCommitments = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const commitmentsQuery = useQuery({
    queryKey: ['commitments', user?.id],
    queryFn: async (): Promise<Commitment[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase.rpc('get_user_commitments', {
        p_user_id: user.id
      })

      if (error) {
        console.log('Error fetching commitments, returning empty array:', error)
        return []
      }
      return (data as Commitment[]) || []
    },
    enabled: !!user,
  })

  const activeCommitmentsQuery = useQuery({
    queryKey: ['active-commitments', user?.id],
    queryFn: async (): Promise<Commitment[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase.rpc('get_active_commitments', {
        p_user_id: user.id
      })

      if (error) {
        console.log('Error fetching active commitments, returning empty array:', error)
        return []
      }
      return (data as Commitment[]) || []
    },
    enabled: !!user,
  })

  const regroupMissionsQuery = useQuery({
    queryKey: ['regroup-missions', user?.id],
    queryFn: async (): Promise<RegroupMission[]> => {
      if (!user) throw new Error('Not authenticated')

      // Get regroup missions that are incomplete (submission_text is null)
      // AND were created from actual failed commitments
      const { data, error } = await supabase
        .from('quest_completions')
        .select('*')
        .eq('user_id', user.id)
        .is('submission_text', null)
        .gte('tokens_awarded', 1) // Regroup missions have tokens > 0
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Error fetching regroup missions:', error)
        return []
      }

      // Filter to only include missions from the last 7 days to prevent old missions from lingering
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const recentMissions = (data as RegroupMission[]).filter(mission => 
        new Date(mission.date_local) >= sevenDaysAgo
      ) || []

      return recentMissions
    },
    enabled: !!user,
  })

  const createCommitmentMutation = useMutation({
    mutationFn: async ({
      duration,
      stakeAmount,
      allyId,
      allyStake = 0,
    }: {
      duration: number
      stakeAmount: number
      allyId?: string
      allyStake?: number
    }) => {
      if (!user) throw new Error('Not authenticated')

      // Check user's previous successful contracts for restrictions
      if (duration === 14) {
        const { data: hasCompleted7Days, error: successError } = await supabase.rpc('check_completed_7_day_contract', {
          p_user_id: user.id
        })

        if (successError) {
          console.log('Error checking previous successes, proceeding without check:', successError)
        }

        if (!hasCompleted7Days) {
          throw new Error('You must complete a 7-day contract before attempting a 14-day contract')
        }
      }

      if (duration === 30) {
        const { data: hasCompleted14Days, error: check14Error } = await supabase.rpc('check_completed_14_day_contract', {
          p_user_id: user.id
        })

        if (check14Error) {
          console.log('Error checking 14-day completions:', check14Error)
        }

        if (!hasCompleted14Days) {
          throw new Error('You must complete a 14-day contract before attempting a 30-day contract')
        }
      }

      // Use the new enhanced function with ally stake matching
      const { data: result, error: commitmentError } = await supabase.rpc('create_commitment_with_ally_stake', {
        p_user_id: user.id,
        p_ally_id: allyId || null,
        p_duration: duration,
        p_user_stake: stakeAmount,
        p_ally_stake: allyStake
      })

      if (commitmentError) throw commitmentError
      
      const response = result as CreateCommitmentResponse
      if (response.error) throw new Error(response.error)

      return response
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
      queryClient.invalidateQueries({ queryKey: ['active-commitments'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      const rewardPercentage = 20 // Standard 20% bonus
      toast({
        title: "Battle Contract Created",
        description: `Your commitment battle has begun. Success will earn ${rewardPercentage}% bonus!`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Contract Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const cancelCommitmentMutation = useMutation({
    mutationFn: async (commitmentId: string) => {
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase.rpc('cancel_commitment', {
        p_commitment_id: commitmentId,
        p_user_id: user.id
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
      queryClient.invalidateQueries({ queryKey: ['active-commitments'] })
      toast({
        title: "Contract Cancelled",
        description: "Your battle contract has been ended early.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const completeRegroupMissionMutation = useMutation({
    mutationFn: async ({ missionId, reflectionText }: { missionId: string, reflectionText: string }) => {
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase.rpc('complete_regroup_mission', {
        p_user_id: user.id,
        p_mission_id: missionId,
        p_reflection_text: reflectionText
      })

      if (error) throw error
      
      const response = result as CompleteRegroupResponse
      if (response.error) throw new Error(response.error)

      return response
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['regroup-missions'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({
        title: "Recovery Complete",
        description: result.message || "Partial honor restored!",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Recovery Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    commitments: commitmentsQuery.data || [],
    activeCommitments: activeCommitmentsQuery.data || [],
    regroupMissions: regroupMissionsQuery.data || [],
    isLoading: commitmentsQuery.isLoading || activeCommitmentsQuery.isLoading,
    error: commitmentsQuery.error || activeCommitmentsQuery.error,
    createCommitment: createCommitmentMutation.mutate,
    cancelCommitment: cancelCommitmentMutation.mutate,
    completeRegroupMission: (missionId: string, reflectionText: string) => 
      completeRegroupMissionMutation.mutate({ missionId, reflectionText }),
    isCreating: createCommitmentMutation.isPending,
    isCancelling: cancelCommitmentMutation.isPending,
    isCompletingRegroup: completeRegroupMissionMutation.isPending,
  }
}
