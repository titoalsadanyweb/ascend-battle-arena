
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAchievements } from '@/lib/hooks/useAchievements'
import { useDashboard } from '@/lib/hooks/useDashboard'
import AchievementCard from './AchievementCard'

interface AchievementsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ open, onOpenChange }) => {
  const { achievements, userAchievements, isLoading } = useAchievements()
  const { dashboardData } = useDashboard()

  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievement_id, ua])
  )

  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, typeof achievements>)

  const getCurrentProgress = (achievement: typeof achievements[0]) => {
    if (!dashboardData) return 0
    
    switch (achievement.requirement_type) {
      case 'streak_days':
        return dashboardData.current_streak
      case 'token_amount':
        return dashboardData.token_balance
      default:
        return 0
    }
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'streak': return 'Streak Achievements'
      case 'token': return 'Token Achievements'
      case 'milestone': return 'Milestones'
      case 'special': return 'Special Achievements'
      default: return category
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Loading Achievements...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>🏆 Achievements</span>
            <span className="text-sm text-gray-500 font-normal">
              ({userAchievements.length} / {achievements.length} unlocked)
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="streak">Streaks</TabsTrigger>
            <TabsTrigger value="token">Tokens</TabsTrigger>
            <TabsTrigger value="milestone">Milestones</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {achievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={userAchievementMap.get(achievement.id)}
                    currentProgress={getCurrentProgress(achievement)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {getCategoryDisplayName(category)}
                  </h3>
                  {categoryAchievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      userAchievement={userAchievementMap.get(achievement.id)}
                      currentProgress={getCurrentProgress(achievement)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AchievementsModal
