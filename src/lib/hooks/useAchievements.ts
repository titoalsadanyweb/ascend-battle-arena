
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface Achievement {
  id: string
  name: string
  description: string
  category: string
  requirement_type: string
  requirement_value: number
  bonus_tokens: number
  rarity: string
  icon_name?: string
  is_active?: boolean
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  bonus_tokens_awarded: number
}

export const useAchievements = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const achievementsQuery = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value', { ascending: true })

      if (error) throw error
      return (data || []) as Achievement[]
    },
  })

  const userAchievementsQuery = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserAchievement[]
    },
    enabled: !!user,
  })

  const checkQuestAchievements = async () => {
    if (!user) return

    const { data: questCompletions, error } = await supabase
      .from('quest_completions')
      .select('id')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching quest completions:', error)
      return
    }

    const questCount = questCompletions?.length || 0

    if (questCount >= 10) {
      await unlockAchievement('quest_starter')
    }
    if (questCount >= 50) {
      await unlockAchievement('quest_enthusiast')
    }
  }

  const checkStreakAchievements = async (currentStreak: number) => {
    if (!user) return

    if (currentStreak >= 3) {
      await unlockAchievement('first_streak')
    }
    if (currentStreak >= 7) {
      await unlockAchievement('week_warrior')
    }
    if (currentStreak >= 14) {
      await unlockAchievement('fortnight_fighter')
    }
    if (currentStreak >= 30) {
      await unlockAchievement('month_master')
    }
  }

  const unlockAchievement = async (achievementId: string) => {
    if (!user) return

    const userAchievements = userAchievementsQuery.data || []
    const achievements = achievementsQuery.data || []

    // Check if already unlocked
    const existing = userAchievements.find(ua => ua.achievement_id === achievementId)
    if (existing) return

    // Find the achievement
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          bonus_tokens_awarded: achievement.bonus_tokens
        })
        .select()
        .single()

      if (error) throw error

      // Award bonus tokens
      if (achievement.bonus_tokens > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('token_balance')
          .eq('id', user.id)
          .single()

        if (profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              token_balance: profile.token_balance + achievement.bonus_tokens
            })
            .eq('id', user.id)

          if (profileError) throw profileError

          // Log transaction
          await supabase
            .from('token_transactions')
            .insert({
              user_id: user.id,
              type: 'achievement_bonus',
              amount: achievement.bonus_tokens
            })
        }
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      // Show toast
      toast({
        title: "Achievement Unlocked! 🏆",
        description: `${achievement.name} - ${achievement.bonus_tokens} Valor Shards earned!`,
      })

    } catch (error) {
      console.error('Error unlocking achievement:', error)
    }
  }

  return {
    achievements: achievementsQuery.data || [],
    userAchievements: userAchievementsQuery.data || [],
    isLoading: achievementsQuery.isLoading || userAchievementsQuery.isLoading,
    checkQuestAchievements,
    checkStreakAchievements,
    unlockAchievement,
  }
}
