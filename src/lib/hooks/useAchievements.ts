import { useQuery, useQueryClient } from '@tanstack/react-query'
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

  // Fetch all achievements
  const achievements = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')

      if (error) throw error
      return data as Achievement[]
    },
  })

  // Fetch user achievements
  const userAchievements = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      return data as UserAchievement[]
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

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          bonus_tokens_awarded: 100
        })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
      toast({
        title: "Achievement Unlocked! 🏆",
        description: "You've earned bonus tokens!",
      })
    } catch (error) {
      console.error('Error unlocking achievement:', error)
    }
  }

  return {
    achievements: achievements.data || [],
    userAchievements: userAchievements.data || [],
    isLoading: achievements.isLoading || userAchievements.isLoading,
    checkQuestAchievements,
    checkStreakAchievements,
    unlockAchievement,
  }
}