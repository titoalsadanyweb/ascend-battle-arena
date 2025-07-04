
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'
import { useAchievements } from './useAchievements'

export interface QuestSession {
  id: string
  status: 'started' | 'in_progress' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
  progress_data: any
}

export interface Quest {
  id: string
  text_prompt: string
  type: string
  difficulty_level: number
  estimated_minutes: number
  mood: string
  energy_level: string
  min_streak: number
  max_streak: number
  cooldown_days: number
  rarity: string
  tags: string
  is_active: boolean
  completed?: boolean
  session?: QuestSession | null
  completion_details?: any
}

export interface SwapResult {
  success: boolean
  new_quest: Quest
  alternatives: Quest[]
  swaps_remaining: number
  message: string
}

export const useQuests = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { checkQuestAchievements } = useAchievements()

  // Fetch today's quest with session data
  const todayQuestQuery = useQuery({
    queryKey: ['quest-today', user?.id],
    queryFn: async (): Promise<Quest | null> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase.functions.invoke('quest-today')

      if (error) {
        console.error('Quest fetch error:', error)
        throw error
      }
      
      console.log('Quest data received:', data)
      return data as Quest
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  })

  // Start quest session
  const startQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      if (!user) throw new Error('Not authenticated')

      console.log('Starting quest session for quest:', questId)

      const { data, error } = await supabase.functions.invoke('quest-start', {
        body: { quest_id: questId }
      })

      if (error) {
        console.error('Quest start error:', error)
        throw error
      }
      
      console.log('Quest start response:', data)
      return data
    },
    onSuccess: (data) => {
      // Update the quest data with session info
      queryClient.setQueryData(['quest-today', user?.id], (oldData: Quest | null) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          session: {
            id: data.session_id,
            status: 'in_progress',
            started_at: data.started_at,
            progress_data: {}
          }
        }
      })
      
      toast({
        title: "Quest Started! 🚀",
        description: "Your daily quest is now in progress.",
      })
    },
    onError: (error: Error) => {
      console.error('Quest start mutation error:', error)
      toast({
        title: "Failed to Start Quest",
        description: error.message || "Failed to start quest. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Complete quest
  const completeQuestMutation = useMutation({
    mutationFn: async ({
      questId,
      submissionText,
      shareWithAlly = false,
      mood,
      energy
    }: {
      questId: string
      submissionText?: string
      shareWithAlly?: boolean
      mood?: string
      energy?: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      console.log('Completing quest with data:', {
        quest_id: questId,
        submission_text: submissionText,
        shareWithAlly,
        mood_selected: mood,
        energy_selected: energy
      })

      const { data, error } = await supabase.functions.invoke('quest-complete', {
        body: {
          quest_id: questId,
          submission_text: submissionText,
          shareWithAlly,
          mood_selected: mood,
          energy_selected: energy
        }
      })

      if (error) {
        console.error('Quest completion error:', error)
        throw error
      }
      
      console.log('Quest completion response:', data)
      return data
    },
    onSuccess: (data) => {
      // Update quest data to show completion
      queryClient.setQueryData(['quest-today', user?.id], (oldData: Quest | null) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          completed: true,
          session: oldData.session ? {
            ...oldData.session,
            status: 'completed' as const,
            completed_at: new Date().toISOString()
          } : null
        }
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['quest-analytics'] })
      
      // Check for quest achievements
      setTimeout(() => {
        checkQuestAchievements()
      }, 500)
      
      toast({
        title: "Quest Complete! 🎉",
        description: `You earned ${data.tokens_awarded} Valor Shards!`,
      })
    },
    onError: (error: Error) => {
      console.error('Quest completion mutation error:', error)
      toast({
        title: "Quest Failed",
        description: error.message || "Failed to complete quest. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Swap quest
  const swapQuestMutation = useMutation({
    mutationFn: async ({ 
      currentQuestId, 
      mood = 'any', 
      energy = 'any' 
    }: { 
      currentQuestId: string
      mood?: string
      energy?: string 
    }) => {
      if (!user) throw new Error('Not authenticated')

      console.log('Swapping quest:', currentQuestId, 'with preferences:', { mood, energy })

      const { data, error } = await supabase.functions.invoke('quest-swap', {
        body: {
          current_quest_id: currentQuestId,
          mood,
          energy
        }
      })

      if (error) {
        console.error('Quest swap error:', error)
        throw error
      }
      
      console.log('Quest swap response:', data)
      return data as SwapResult
    },
    onSuccess: (data) => {
      // Update quest data with the new quest
      queryClient.setQueryData(['quest-today', user?.id], data.new_quest)
      
      toast({
        title: "Quest Swapped! 🔄",
        description: data.message,
      })
    },
    onError: (error: Error) => {
      console.error('Quest swap mutation error:', error)
      toast({
        title: "Swap Failed",
        description: error.message || "Failed to swap quest. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Refresh quest with preferences (for mood/energy selector)
  const refreshQuestWithPreferences = useMutation({
    mutationFn: async ({ mood, energy }: { mood: string; energy: string }) => {
      if (!user) throw new Error('Not authenticated')

      const searchParams = new URLSearchParams()
      if (mood !== 'any') searchParams.append('mood', mood)
      if (energy !== 'any') searchParams.append('energy', energy)

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/quest-today?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch quest')
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['quest-today', user?.id], data)
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to refresh quest",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Helper function to check if quest is in progress
  const isQuestInProgress = () => {
    const quest = todayQuestQuery.data
    return quest?.session?.status === 'in_progress'
  }

  // Helper function to check if quest is completed
  const isQuestCompleted = () => {
    const quest = todayQuestQuery.data
    return quest?.completed === true || quest?.session?.status === 'completed'
  }

  // Helper function to get quest progress time
  const getQuestProgressTime = () => {
    const quest = todayQuestQuery.data
    if (!quest?.session?.started_at) return 0
    
    const startTime = new Date(quest.session.started_at).getTime()
    const currentTime = Date.now()
    return Math.floor((currentTime - startTime) / (1000 * 60)) // minutes
  }

  return {
    // Data
    todayQuest: todayQuestQuery.data,
    
    // Loading states
    isLoading: todayQuestQuery.isLoading,
    isStarting: startQuestMutation.isPending,
    isCompleting: completeQuestMutation.isPending,
    isSwapping: swapQuestMutation.isPending,
    isRefreshing: refreshQuestWithPreferences.isPending,
    
    // Error states
    error: todayQuestQuery.error,
    
    // Actions
    startQuest: startQuestMutation.mutate,
    completeQuest: completeQuestMutation.mutate,
    swapQuest: swapQuestMutation.mutate,
    refreshQuestWithPreferences: refreshQuestWithPreferences.mutate,
    
    // Helper functions
    isQuestInProgress,
    isQuestCompleted,
    getQuestProgressTime,
    
    // Refetch function
    refetch: todayQuestQuery.refetch,
  }
}
