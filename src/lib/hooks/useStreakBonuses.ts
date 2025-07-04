
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'

export interface StreakBonus {
  id: string
  name: string
  description: string
  streak_required: number
  bonus_tokens: number
  bonus_type: 'tokens' | 'multiplier' | 'unlock' | 'special'
  is_unlocked: boolean
  progress_percentage: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface StreakMilestone {
  streak: number
  title: string
  reward: string
  tokenBonus: number
  isReached: boolean
  isNext: boolean
}

export const useStreakBonuses = () => {
  const { user } = useAuth()

  const streakBonusesQuery = useQuery({
    queryKey: ['streak-bonuses', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      // Get user's current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, best_streak')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      const currentStreak = profile.current_streak || 0
      const bestStreak = profile.best_streak || 0

      // Define streak milestones
      const milestones: StreakMilestone[] = [
        {
          streak: 1,
          title: "First Victory",
          reward: "Welcome Warrior",
          tokenBonus: 5,
          isReached: currentStreak >= 1,
          isNext: currentStreak === 0
        },
        {
          streak: 3,
          title: "Building Momentum",
          reward: "Consistency Badge",
          tokenBonus: 15,
          isReached: currentStreak >= 3,
          isNext: currentStreak >= 1 && currentStreak < 3
        },
        {
          streak: 7,
          title: "One Week Warrior",
          reward: "Weekly Champion",
          tokenBonus: 50,
          isReached: currentStreak >= 7,
          isNext: currentStreak >= 3 && currentStreak < 7
        },
        {
          streak: 14,
          title: "Fortnight Fighter",
          reward: "Discipline Master",
          tokenBonus: 100,
          isReached: currentStreak >= 14,
          isNext: currentStreak >= 7 && currentStreak < 14
        },
        {
          streak: 30,
          title: "Monthly Master",
          reward: "Elite Status",
          tokenBonus: 250,
          isReached: currentStreak >= 30,
          isNext: currentStreak >= 14 && currentStreak < 30
        },
        {
          streak: 60,
          title: "Legendary Warrior",
          reward: "Legendary Badge",
          tokenBonus: 500,
          isReached: currentStreak >= 60,
          isNext: currentStreak >= 30 && currentStreak < 60
        },
        {
          streak: 100,
          title: "Century Conqueror",
          reward: "Ultimate Champion",
          tokenBonus: 1000,
          isReached: currentStreak >= 100,
          isNext: currentStreak >= 60 && currentStreak < 100
        }
      ]

      // Calculate dynamic bonuses
      const bonuses: StreakBonus[] = milestones.map((milestone, index) => ({
        id: `milestone-${milestone.streak}`,
        name: milestone.title,
        description: milestone.reward,
        streak_required: milestone.streak,
        bonus_tokens: milestone.tokenBonus,
        bonus_type: 'tokens' as const,
        is_unlocked: milestone.isReached,
        progress_percentage: milestone.isReached ? 100 : 
          (currentStreak / milestone.streak) * 100,
        rarity: milestone.streak <= 7 ? 'common' : 
                milestone.streak <= 30 ? 'rare' : 
                milestone.streak <= 60 ? 'epic' : 'legendary'
      }))

      // Calculate streak multipliers
      const streakMultiplier = calculateStreakMultiplier(currentStreak)
      const nextMilestone = milestones.find(m => m.isNext)

      return {
        currentStreak,
        bestStreak,
        streakMultiplier,
        bonuses,
        milestones,
        nextMilestone,
        daysUntilNextMilestone: nextMilestone ? nextMilestone.streak - currentStreak : 0
      }
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })

  return {
    streakData: streakBonusesQuery.data,
    isLoading: streakBonusesQuery.isLoading,
    error: streakBonusesQuery.error,
    refetch: streakBonusesQuery.refetch,
  }
}

function calculateStreakMultiplier(streak: number): number {
  if (streak < 3) return 1.0
  if (streak < 7) return 1.2
  if (streak < 14) return 1.5
  if (streak < 30) return 1.8
  if (streak < 60) return 2.0
  if (streak < 100) return 2.5
  return 3.0
}

export const getStreakBonus = (baseTokens: number, streak: number): number => {
  const multiplier = calculateStreakMultiplier(streak)
  return Math.floor(baseTokens * multiplier) - baseTokens
}
