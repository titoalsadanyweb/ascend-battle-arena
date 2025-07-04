
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Gift, Star, Crown, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStreakBonuses, StreakMilestone } from '@/lib/hooks/useStreakBonuses'

interface StreakBonusDisplayProps {
  className?: string
}

const StreakBonusDisplay: React.FC<StreakBonusDisplayProps> = ({
  className = ''
}) => {
  const { streakData, isLoading } = useStreakBonuses()

  if (isLoading || !streakData) {
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

  const getMilestoneIcon = (milestone: StreakMilestone) => {
    if (milestone.streak <= 3) return <Star className="h-4 w-4" />
    if (milestone.streak <= 14) return <Gift className="h-4 w-4" />
    if (milestone.streak <= 60) return <Trophy className="h-4 w-4" />
    return <Crown className="h-4 w-4" />
  }

  const getMilestoneColor = (milestone: StreakMilestone, isReached: boolean) => {
    if (!isReached) return 'text-gray-400'
    if (milestone.streak <= 3) return 'text-blue-600'
    if (milestone.streak <= 14) return 'text-green-600'
    if (milestone.streak <= 60) return 'text-purple-600'
    return 'text-yellow-600'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-600" />
          <CardTitle>Streak Bonuses</CardTitle>
        </div>
        <CardDescription>
          Earn bonus rewards for maintaining your streak
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Current</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {streakData.currentStreak}
            </div>
            <div className="text-xs text-orange-700">
              {streakData.streakMultiplier}x multiplier
            </div>
          </div>
          
          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Best</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {streakData.bestStreak}
            </div>
            <div className="text-xs text-amber-700">days</div>
          </div>
        </motion.div>

        {/* Next Milestone */}
        {streakData.nextMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getMilestoneIcon(streakData.nextMilestone)}
                <span className="font-medium text-gray-900">
                  Next: {streakData.nextMilestone.title}
                </span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                <Gift className="h-3 w-3 mr-1" />
                +{streakData.nextMilestone.tokenBonus}
              </Badge>
            </div>
            <Progress 
              value={(streakData.currentStreak / streakData.nextMilestone.streak) * 100} 
              className="h-2 mb-2"
            />
            <div className="text-xs text-gray-600">
              {streakData.daysUntilNextMilestone} days remaining • {streakData.nextMilestone.reward}
            </div>
          </motion.div>
        )}

        {/* Milestone History */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Milestones</h4>
          <div className="grid gap-2">
            {streakData.milestones.slice(0, 6).map((milestone, index) => (
              <motion.div
                key={milestone.streak}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  milestone.isReached 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={getMilestoneColor(milestone, milestone.isReached)}>
                    {getMilestoneIcon(milestone)}
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${
                      milestone.isReached ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      Day {milestone.streak}: {milestone.title}
                    </div>
                    <div className={`text-xs ${
                      milestone.isReached ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {milestone.reward}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={milestone.isReached ? "default" : "secondary"}
                  className={`text-xs ${
                    milestone.isReached 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  +{milestone.tokenBonus}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StreakBonusDisplay
