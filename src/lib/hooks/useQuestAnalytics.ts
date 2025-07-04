
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'

export interface QuestAnalytics {
  totalQuests: number
  completionRate: number
  favoriteTypes: { type: string; count: number; percentage: number }[]
  averageCompletionTime: number
  streakHistory: { date: string; completed: boolean }[]
  moodPatterns: { mood: string; count: number }[]
  energyPatterns: { energy: string; count: number }[]
  categoryMastery: { category: string; completed: number; total: number }[]
}

export const useQuestAnalytics = () => {
  const { user } = useAuth()

  const analyticsQuery = useQuery({
    queryKey: ['quest-analytics', user?.id],
    queryFn: async (): Promise<QuestAnalytics> => {
      if (!user) throw new Error('Not authenticated')

      // Get quest completions for analytics
      const { data: completions, error } = await supabase
        .from('quest_completions')
        .select(`
          *,
          quest:quests(type, difficulty_level, estimated_minutes)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) throw error

      const totalQuests = completions?.length || 0
      
      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentCompletions = completions?.filter(c => 
        new Date(c.completed_at) >= thirtyDaysAgo
      ) || []

      // Analyze favorite types
      const typeCounts = completions?.reduce((acc, completion) => {
        const type = completion.quest?.type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const favoriteTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalQuests > 0 ? (count / totalQuests) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)

      // Mood and energy patterns
      const moodCounts = completions?.reduce((acc, completion) => {
        if (completion.mood_selected) {
          acc[completion.mood_selected] = (acc[completion.mood_selected] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}

      const energyCounts = completions?.reduce((acc, completion) => {
        if (completion.energy_selected) {
          acc[completion.energy_selected] = (acc[completion.energy_selected] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}

      const moodPatterns = Object.entries(moodCounts).map(([mood, count]) => ({ mood, count }))
      const energyPatterns = Object.entries(energyCounts).map(([energy, count]) => ({ energy, count }))

      // Calculate average completion time (simplified)
      const avgTime = completions?.reduce((acc, completion) => {
        return acc + (completion.quest?.estimated_minutes || 5)
      }, 0) / Math.max(totalQuests, 1) || 5

      return {
        totalQuests,
        completionRate: recentCompletions.length / 30 * 100, // Simplified
        favoriteTypes,
        averageCompletionTime: avgTime,
        streakHistory: [], // Will implement with more data
        moodPatterns,
        energyPatterns,
        categoryMastery: favoriteTypes.slice(0, 5).map(ft => ({
          category: ft.type,
          completed: ft.count,
          total: ft.count + Math.floor(Math.random() * 5) // Simplified for now
        }))
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  }
}
