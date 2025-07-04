
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Sparkles, TrendingUp, Target, Heart, Star, Flame, Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuestRecommendations, QuestRecommendation } from '@/lib/hooks/useQuestRecommendations'
import { useStreakBonuses } from '@/lib/hooks/useStreakBonuses'

interface QuestRecommendationEngineProps {
  onQuestSelect: (quest: QuestRecommendation) => void
  className?: string
}

const QuestRecommendationEngine: React.FC<QuestRecommendationEngineProps> = ({
  onQuestSelect,
  className = ''
}) => {
  const { recommendations, isLoading } = useQuestRecommendations()
  const { streakData } = useStreakBonuses()
  const [selectedTab, setSelectedTab] = useState('personalized')

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recommendations) {
    return null
  }

  const renderQuestCard = (quest: QuestRecommendation, index: number) => (
    <motion.div
      key={quest.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary"
        onClick={() => onQuestSelect(quest)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {quest.type}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  quest.difficulty_level <= 2 ? 'text-green-600' :
                  quest.difficulty_level <= 3 ? 'text-yellow-600' :
                  'text-red-600'
                }`}
              >
                Level {quest.difficulty_level}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-gray-600">{quest.recommendation_score}</span>
            </div>
          </div>
          
          <p className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
            {quest.text_prompt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{quest.recommendation_reason}</span>
            {quest.estimated_minutes && (
              <span>{quest.estimated_minutes}m</span>
            )}
          </div>
          
          {quest.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {quest.tags.slice(0, 2).map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle>Quest Recommendations</CardTitle>
        </div>
        <CardDescription>
          Personalized quest suggestions based on your preferences and progress
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Streak Bonus Display */}
        {streakData?.nextMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-amber-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-gray-900">
                  {streakData.daysUntilNextMilestone} days to {streakData.nextMilestone.title}
                </span>
              </div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                <Gift className="h-3 w-3 mr-1" />
                +{streakData.nextMilestone.tokenBonus} Shards
              </Badge>
            </div>
            <Progress 
              value={(streakData.currentStreak / streakData.nextMilestone.streak) * 100} 
              className="h-2"
            />
          </motion.div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personalized" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="challenge" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Challenge
            </TabsTrigger>
            <TabsTrigger value="comfort" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Comfort
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="space-y-3 mt-4">
            {recommendations.personalizedQuests.length > 0 ? (
              recommendations.personalizedQuests.map((quest, index) => 
                renderQuestCard(quest, index)
              )
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Complete more quests to get personalized recommendations</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-3 mt-4">
            {recommendations.trendingQuests.map((quest, index) => 
              renderQuestCard(quest, index)
            )}
          </TabsContent>

          <TabsContent value="challenge" className="space-y-3 mt-4">
            {recommendations.challengeQuests.length > 0 ? (
              recommendations.challengeQuests.map((quest, index) => 
                renderQuestCard(quest, index)
              )
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No challenge quests available for your level</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comfort" className="space-y-3 mt-4">
            {recommendations.comfortZoneQuests.length > 0 ? (
              recommendations.comfortZoneQuests.map((quest, index) => 
                renderQuestCard(quest, index)
              )
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comfort zone quests available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default QuestRecommendationEngine
