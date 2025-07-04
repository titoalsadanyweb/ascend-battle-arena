
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import * as LucideIcons from 'lucide-react'
import { Achievement, UserAchievement } from '@/lib/hooks/useAchievements'

interface AchievementCardProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  currentProgress?: number
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userAchievement,
  currentProgress = 0
}) => {
  const isUnlocked = !!userAchievement
  const IconComponent = achievement.icon_name 
    ? (LucideIcons as any)[achievement.icon_name] || LucideIcons.Award
    : LucideIcons.Award

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-br from-yellow-400 to-orange-500'
      case 'epic': return 'bg-gradient-to-br from-purple-500 to-pink-500'
      case 'rare': return 'bg-gradient-to-br from-blue-500 to-cyan-500'
      default: return 'bg-gradient-to-br from-gray-400 to-gray-500'
    }
  }

  const progressPercentage = isUnlocked 
    ? 100 
    : Math.min((currentProgress / achievement.requirement_value) * 100, 100)

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-lg ${
      isUnlocked ? 'ring-2 ring-yellow-400 shadow-lg' : 'opacity-75'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Achievement Icon */}
          <div className={`p-3 rounded-full ${getRarityColor(achievement.rarity)} ${
            isUnlocked ? '' : 'grayscale'
          }`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>

          {/* Achievement Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${
                isUnlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h3>
              <Badge variant={isUnlocked ? 'default' : 'secondary'} className="capitalize">
                {achievement.rarity}
              </Badge>
            </div>

            <p className={`text-sm mb-3 ${
              isUnlocked ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {achievement.description}
            </p>

            {/* Progress Bar */}
            {!isUnlocked && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{currentProgress} / {achievement.requirement_value}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Unlocked Date */}
            {isUnlocked && userAchievement && (
              <div className="text-xs text-gray-500">
                Unlocked: {new Date(userAchievement.unlocked_at).toLocaleDateString()}
              </div>
            )}

            {/* Bonus Tokens */}
            {achievement.bonus_tokens > 0 && (
              <div className="mt-2 text-xs text-yellow-600 font-medium">
                🪙 +{achievement.bonus_tokens} Valor Shards
              </div>
            )}
          </div>
        </div>

        {/* Unlocked Badge */}
        {isUnlocked && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">
              Unlocked
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AchievementCard
