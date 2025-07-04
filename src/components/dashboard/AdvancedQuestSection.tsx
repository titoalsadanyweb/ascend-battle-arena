
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Sparkles, Target, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import QuestCard from '@/components/quests/QuestCard'
import QuestRecommendationEngine from '@/components/quests/QuestRecommendationEngine'
import StreakBonusDisplay from '@/components/quests/StreakBonusDisplay'
import QuestProgress from '@/components/quests/QuestProgress'
import QuestJournal from '@/components/quests/QuestJournal'
import QuestSwapper from '@/components/quests/QuestSwapper'
import { useQuests } from '@/lib/hooks/useQuests'
import { useQuestAnalytics } from '@/lib/hooks/useQuestAnalytics'
import { QuestRecommendation } from '@/lib/hooks/useQuestRecommendations'

const AdvancedQuestSection: React.FC = () => {
  const { todayQuest, isLoading, swapQuest } = useQuests()
  const { analytics } = useQuestAnalytics()
  
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showSwapper, setShowSwapper] = useState(false)
  const [selectedTab, setSelectedTab] = useState('quest')

  const handleQuestSelect = (quest: QuestRecommendation) => {
    if (todayQuest) {
      swapQuest({ 
        currentQuestId: todayQuest.id, 
        mood: 'any', 
        energy: 'any' 
      })
    }
    setShowRecommendations(false)
    setShowSwapper(false)
  }

  const isQuestCompleted = todayQuest?.completed || todayQuest?.session?.status === 'completed'

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>AI-Enhanced Quest System</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!isQuestCompleted && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Recommendations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSwapper(!showSwapper)}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Swap Quest
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription>
          Personalized quest system with AI recommendations and streak bonuses
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quest">Today's Quest</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="quest" className="space-y-4 mt-6">
            {showRecommendations ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <QuestRecommendationEngine
                  onQuestSelect={handleQuestSelect}
                />
              </motion.div>
            ) : showSwapper ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <QuestSwapper
                  currentQuest={todayQuest}
                  onQuestSelected={handleQuestSelect}
                  onCancel={() => setShowSwapper(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <QuestCard />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <QuestProgress
              completedToday={isQuestCompleted}
              weeklyProgress={analytics?.completionRate || 0}
              monthlyProgress={(analytics?.totalQuests || 0) / 30 * 100}
              currentStreak={0} // Will be updated from dashboard data
              questsThisWeek={Math.min(7, analytics?.totalQuests || 0)}
              questsThisMonth={analytics?.totalQuests || 0}
            />
          </TabsContent>

          <TabsContent value="bonuses" className="mt-6">
            <StreakBonusDisplay />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <QuestJournal />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AdvancedQuestSection
