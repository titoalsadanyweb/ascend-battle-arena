
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'

export interface QuestRecommendation {
  id: string
  text_prompt: string
  type: string
  difficulty_level: number
  estimated_minutes: number
  mood: string
  energy_level: string
  tags: string[]
  rarity: string
  recommendation_score: number
  recommendation_reason: string
}

export interface RecommendationEngine {
  personalizedQuests: QuestRecommendation[]
  trendingQuests: QuestRecommendation[]
  challengeQuests: QuestRecommendation[]
  comfortZoneQuests: QuestRecommendation[]
}

export const useQuestRecommendations = () => {
  const { user } = useAuth()

  const recommendationsQuery = useQuery({
    queryKey: ['quest-recommendations', user?.id],
    queryFn: async (): Promise<RecommendationEngine> => {
      if (!user) throw new Error('Not authenticated')

      // Get user's quest history and preferences
      const { data: completions, error: completionsError } = await supabase
        .from('quest_completions')
        .select(`
          *,
          quest:quests(*)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50)

      if (completionsError) throw completionsError

      // Get user profile for streak and preferences
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, best_streak')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Analyze user patterns
      const completedQuests = completions || []
      const favoriteTypes = analyzeFavoriteTypes(completedQuests)
      const preferredDifficulty = analyzePreferredDifficulty(completedQuests)
      const moodPatterns = analyzeMoodPatterns(completedQuests)
      const energyPatterns = analyzeEnergyPatterns(completedQuests)

      // Get all available quests
      const { data: allQuests, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .lte('min_streak', profile.current_streak)
        .gte('max_streak', profile.current_streak)

      if (questsError) throw questsError

      const availableQuests = allQuests || []

      // Generate recommendations
      const personalizedQuests = generatePersonalizedRecommendations(
        availableQuests,
        favoriteTypes,
        preferredDifficulty,
        moodPatterns,
        energyPatterns,
        profile.current_streak
      )

      const trendingQuests = generateTrendingRecommendations(availableQuests, profile.current_streak)
      const challengeQuests = generateChallengeRecommendations(availableQuests, preferredDifficulty, profile.current_streak)
      const comfortZoneQuests = generateComfortZoneRecommendations(availableQuests, favoriteTypes, preferredDifficulty)

      return {
        personalizedQuests,
        trendingQuests,
        challengeQuests,
        comfortZoneQuests
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    recommendations: recommendationsQuery.data,
    isLoading: recommendationsQuery.isLoading,
    error: recommendationsQuery.error,
    refetch: recommendationsQuery.refetch,
  }
}

// Helper functions for analysis
function analyzeFavoriteTypes(completions: any[]) {
  const typeCounts: Record<string, number> = {}
  completions.forEach(completion => {
    const type = completion.quest?.type || 'unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  
  return Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type)
}

function analyzePreferredDifficulty(completions: any[]) {
  if (completions.length === 0) return 2
  
  const difficulties = completions
    .map(c => c.quest?.difficulty_level || 2)
    .filter(d => d)
  
  return Math.round(difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length)
}

function analyzeMoodPatterns(completions: any[]) {
  const moodCounts: Record<string, number> = {}
  completions.forEach(completion => {
    if (completion.mood_selected) {
      moodCounts[completion.mood_selected] = (moodCounts[completion.mood_selected] || 0) + 1
    }
  })
  
  return Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([mood]) => mood)
}

function analyzeEnergyPatterns(completions: any[]) {
  const energyCounts: Record<string, number> = {}
  completions.forEach(completion => {
    if (completion.energy_selected) {
      energyCounts[completion.energy_selected] = (energyCounts[completion.energy_selected] || 0) + 1
    }
  })
  
  return Object.entries(energyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([energy]) => energy)
}

// Recommendation generators
function generatePersonalizedRecommendations(
  quests: any[],
  favoriteTypes: string[],
  preferredDifficulty: number,
  moodPatterns: string[],
  energyPatterns: string[],
  currentStreak: number
): QuestRecommendation[] {
  return quests
    .map(quest => {
      let score = 50 // Base score
      let reasons: string[] = []

      // Type preference bonus
      if (favoriteTypes.includes(quest.type)) {
        score += 25
        reasons.push(`matches your favorite type: ${quest.type}`)
      }

      // Difficulty preference bonus
      if (Math.abs(quest.difficulty_level - preferredDifficulty) <= 1) {
        score += 15
        reasons.push(`difficulty matches your preference`)
      }

      // Mood pattern bonus
      if (moodPatterns.includes(quest.mood)) {
        score += 10
        reasons.push(`matches your mood patterns`)
      }

      // Energy pattern bonus
      if (energyPatterns.includes(quest.energy_level)) {
        score += 10
        reasons.push(`matches your energy patterns`)
      }

      // Streak-based bonuses
      if (currentStreak >= 7 && quest.rarity === 'rare') {
        score += 15
        reasons.push(`special quest for your ${currentStreak}-day streak`)
      }

      return {
        ...quest,
        tags: parseTags(quest.tags),
        recommendation_score: score,
        recommendation_reason: reasons.length > 0 ? reasons.join(', ') : 'recommended for you'
      }
    })
    .filter(quest => quest.recommendation_score >= 70)
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, 5)
}

function generateTrendingRecommendations(quests: any[], currentStreak: number): QuestRecommendation[] {
  // Simulate trending based on quest properties
  return quests
    .filter(quest => quest.type === 'mindfulness' || quest.type === 'reflection')
    .map(quest => ({
      ...quest,
      tags: parseTags(quest.tags),
      recommendation_score: 80 + Math.random() * 20,
      recommendation_reason: 'trending this week'
    }))
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, 4)
}

function generateChallengeRecommendations(
  quests: any[],
  preferredDifficulty: number,
  currentStreak: number
): QuestRecommendation[] {
  const targetDifficulty = Math.min(5, preferredDifficulty + 1)
  
  return quests
    .filter(quest => quest.difficulty_level >= targetDifficulty)
    .map(quest => ({
      ...quest,
      tags: parseTags(quest.tags),
      recommendation_score: 75,
      recommendation_reason: `challenge quest - level ${quest.difficulty_level}`
    }))
    .slice(0, 3)
}

function generateComfortZoneRecommendations(
  quests: any[],
  favoriteTypes: string[],
  preferredDifficulty: number
): QuestRecommendation[] {
  const targetDifficulty = Math.max(1, preferredDifficulty - 1)
  
  return quests
    .filter(quest => 
      favoriteTypes.includes(quest.type) && 
      quest.difficulty_level <= targetDifficulty
    )
    .map(quest => ({
      ...quest,
      tags: parseTags(quest.tags),
      recommendation_score: 70,
      recommendation_reason: 'comfort zone - easy win'
    }))
    .slice(0, 3)
}

function parseTags(tags: any): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      if (Array.isArray(parsed)) return parsed
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    } catch {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }
  }
  return []
}
