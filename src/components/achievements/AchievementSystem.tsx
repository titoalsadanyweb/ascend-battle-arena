
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Calendar, Zap, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/hooks/useProfile'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond'
  category: 'streak' | 'quest' | 'social' | 'special'
  requirement: number
  progress: number
  unlocked: boolean
  reward: number
}

const AchievementSystem: React.FC = () => {
  const { profile } = useProfile()

  const achievements: Achievement[] = [
    {
      id: 'first_victory',
      name: 'First Victory',
      description: 'Complete your first daily check-in',
      icon: <Star className="h-5 w-5" />,
      rarity: 'bronze',
      category: 'streak',
      requirement: 1,
      progress: Math.min(profile?.current_streak || 0, 1),
      unlocked: (profile?.current_streak || 0) >= 1,
      reward: 10
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: <Trophy className="h-5 w-5" />,
      rarity: 'silver',
      category: 'streak',
      requirement: 7,
      progress: Math.min(profile?.best_streak || 0, 7),
      unlocked: (profile?.best_streak || 0) >= 7,
      reward: 50
    },
    {
      id: 'month_master',
      name: 'Month Master',
      description: 'Achieve a 30-day streak',
      icon: <Crown className="h-5 w-5" />,
      rarity: 'gold',
      category: 'streak',
      requirement: 30,
      progress: Math.min(profile?.best_streak || 0, 30),
      unlocked: (profile?.best_streak || 0) >= 30,
      reward: 200
    },
    {
      id: 'quest_enthusiast',
      name: 'Quest Enthusiast',
      description: 'Complete 50 daily quests',
      icon: <Target className="h-5 w-5" />,
      rarity: 'silver',
      category: 'quest',
      requirement: 50,
      progress: 23, // Mock progress
      unlocked: false,
      reward: 75
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Form your first Battle Ally partnership',
      icon: <Zap className="h-5 w-5" />,
      rarity: 'bronze',
      category: 'social',
      requirement: 1,
      progress: 0, // Mock progress
      unlocked: false,
      reward: 25
    },
    {
      id: 'token_collector',
      name: 'Token Collector',
      description: 'Accumulate 1000 Valor Shards',
      icon: <Star className="h-5 w-5" />,
      rarity: 'gold',
      category: 'special',
      requirement: 1000,
      progress: profile?.token_balance || 0,
      unlocked: (profile?.token_balance || 0) >= 1000,
      reward: 100
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'diamond': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak': return <Calendar className="h-4 w-4" />
      case 'quest': return <Target className="h-4 w-4" />
      case 'social': return <Zap className="h-4 w-4" />
      case 'special': return <Star className="h-4 w-4" />
      default: return <Trophy className="h-4 w-4" />
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalRewards = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedCount}/{achievements.length}</div>
            <p className="text-xs text-muted-foreground">Unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Earned</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards}</div>
            <p className="text-xs text-muted-foreground">Valor Shards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
              achievement.unlocked 
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' 
                : 'border-muted'
            }`}>
              {achievement.unlocked && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400 to-amber-500 -mr-8 -mt-8 rotate-45"></div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {achievement.name}
                        {achievement.unlocked && (
                          <Trophy className="h-4 w-4 text-yellow-600" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(achievement.category)}
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {achievement.unlocked && (
                    <Badge className="bg-green-100 text-green-800">
                      +{achievement.reward} SIT
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <CardDescription>{achievement.description}</CardDescription>
                
                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.requirement}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.requirement) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {achievement.unlocked && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">Achievement Unlocked!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AchievementSystem
