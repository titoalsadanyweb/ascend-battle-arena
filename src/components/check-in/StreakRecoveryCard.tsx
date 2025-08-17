import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Shield, Target, Clock } from 'lucide-react'

interface StreakRecoveryCardProps {
  currentStreak: number
  bestStreak: number
  lastCheckInDate?: string
  onStartRecovery: () => void
}

const StreakRecoveryCard: React.FC<StreakRecoveryCardProps> = ({
  currentStreak,
  bestStreak,
  lastCheckInDate,
  onStartRecovery
}) => {
  const isStreakBroken = currentStreak === 0 && bestStreak > 0
  const daysSinceBest = bestStreak - currentStreak
  const recoveryProgress = Math.min((currentStreak / bestStreak) * 100, 100)

  if (!isStreakBroken && currentStreak >= bestStreak) {
    return null // Don't show recovery card if streak is strong
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg text-orange-800">
                {isStreakBroken ? 'Recovery Mode' : 'Rebuilding Strength'}
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              {isStreakBroken ? 'Streak Reset' : 'Building Up'}
            </Badge>
          </div>
          <CardDescription className="text-orange-700">
            {isStreakBroken 
              ? "Every warrior faces setbacks. Your comeback story starts now."
              : `Rebuilding towards your best streak of ${bestStreak} days`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Recovery Progress */}
          {!isStreakBroken && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Recovery Progress</span>
                <span className="font-medium text-orange-800">
                  {currentStreak}/{bestStreak} days
                </span>
              </div>
              <Progress 
                value={recoveryProgress} 
                className="h-2 bg-orange-100"
              />
            </div>
          )}

          {/* Recovery Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/50 rounded-lg border border-orange-200">
              <div className="text-xl font-bold text-orange-800">{currentStreak}</div>
              <div className="text-xs text-orange-600">Current</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-orange-200">
              <div className="text-xl font-bold text-orange-800">{bestStreak}</div>
              <div className="text-xs text-orange-600">Best Ever</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-orange-200">
              <div className="text-xl font-bold text-orange-800">{daysSinceBest}</div>
              <div className="text-xs text-orange-600">To Reclaim</div>
            </div>
          </div>

          {/* Recovery Strategies */}
          <div className="space-y-2">
            <h4 className="font-medium text-orange-800 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recovery Focus
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded border border-orange-200">
                <Shield className="h-3 w-3 text-orange-500" />
                <span className="text-sm text-orange-700">Daily check-ins for consistency</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded border border-orange-200">
                <Clock className="h-3 w-3 text-orange-500" />
                <span className="text-sm text-orange-700">
                  {isStreakBroken ? 'Start with 24-hour goals' : `${7 - (currentStreak % 7)} days to next milestone`}
                </span>
              </div>
            </div>
          </div>

          {/* Recovery Action */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onStartRecovery}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              {isStreakBroken ? 'Begin Recovery Journey' : 'Continue Building'}
            </Button>
          </motion.div>

          {/* Motivational Message */}
          <div className="text-center p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-orange-800">
              {isStreakBroken 
                ? "\"The comeback is always stronger than the setback.\""
                : `"You're ${Math.round((currentStreak / bestStreak) * 100)}% back to your peak!"`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default StreakRecoveryCard