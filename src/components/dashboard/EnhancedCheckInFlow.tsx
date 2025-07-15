import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useCheckIn } from "@/lib/hooks/useCheckIn"
import { useDashboard } from "@/lib/hooks/useDashboard"
import { Shield, Flame, Trophy, Star, Zap, Target, Swords } from 'lucide-react'

interface EnhancedCheckInFlowProps {
  hasCheckedInToday: boolean
  currentStreak: number
  bestStreak: number
  tokenBalance: number
}

const EnhancedCheckInFlow: React.FC<EnhancedCheckInFlowProps> = ({
  hasCheckedInToday,
  currentStreak,
  bestStreak,
  tokenBalance
}) => {
  const { checkIn, isCheckingIn } = useCheckIn()
  const [showCelebration, setShowCelebration] = useState(false)
  const [streakProgress, setStreakProgress] = useState(0)
  
  const nextMilestone = [7, 14, 30, 60, 90, 180, 365].find(m => m > currentStreak) || 365
  const progressToNextMilestone = currentStreak > 0 ? (currentStreak / nextMilestone) * 100 : 0

  useEffect(() => {
    setStreakProgress(progressToNextMilestone)
  }, [progressToNextMilestone])

  const handleCheckIn = async () => {
    try {
      await checkIn({ status: 'victory' })
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    } catch (error) {
      console.error('Check-in failed:', error)
    }
  }

  const getMotivationalMessage = () => {
    if (hasCheckedInToday) {
      return "🏆 Victory achieved! Your discipline strengthens with each triumph."
    }
    
    if (currentStreak === 0) {
      return "🌅 Today marks the beginning of your transformation. Every journey starts with a single step."
    }
    
    if (currentStreak < 7) {
      return `🔥 Day ${currentStreak + 1} awaits. Building the foundation of an unbreakable will.`
    }
    
    if (currentStreak < 30) {
      return `⚡ ${currentStreak} days strong! The fire of discipline burns bright within you.`
    }
    
    return `👑 ${currentStreak} days of mastery! You are becoming the architect of your own destiny.`
  }

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'from-purple-500 to-pink-500'
    if (currentStreak >= 14) return 'from-orange-500 to-red-500'
    if (currentStreak >= 7) return 'from-blue-500 to-cyan-500'
    return 'from-green-500 to-emerald-500'
  }

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: 1 }}
              className="text-center text-white"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-black mb-2">VICTORY!</h2>
              <p className="text-xl">Your strength grows with each triumph</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Check-in Card */}
      <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <CardHeader className="text-center pb-2">
            <motion.div
              animate={{ 
                scale: hasCheckedInToday ? [1, 1.1, 1] : 1,
                rotate: hasCheckedInToday ? [0, 360] : 0
              }}
              transition={{ duration: 2, repeat: hasCheckedInToday ? Infinity : 0, repeatDelay: 3 }}
              className="mx-auto mb-4"
            >
              {hasCheckedInToday ? (
                <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
              ) : (
                <Shield className="h-16 w-16 text-blue-400 drop-shadow-lg" />
              )}
            </motion.div>
            
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              WARRIOR'S DECLARATION
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg font-medium">
              {getMotivationalMessage()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Streak Display */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className={`text-4xl font-black bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}>
                    {currentStreak}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Current</div>
                </div>
                
                <div className="text-6xl">⚔️</div>
                
                <div className="text-center">
                  <div className="text-4xl font-black text-yellow-400">
                    {bestStreak}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Best</div>
                </div>
              </div>

              {/* Progress to Next Milestone */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Progress to {nextMilestone} days</span>
                  <span>{currentStreak}/{nextMilestone}</span>
                </div>
                <Progress value={progressToNextMilestone} className="h-3" />
              </div>
            </div>

            {/* Token Balance */}
            <div className="flex items-center justify-center gap-3 p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
              <Zap className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">{tokenBalance.toLocaleString()}</span>
              <span className="text-gray-300">Valor Shards</span>
            </div>

            {/* Action Button */}
            <div className="text-center">
              {hasCheckedInToday ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="space-y-4"
                >
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-6 py-2">
                    <Trophy className="h-5 w-5 mr-2" />
                    VICTORY CLAIMED
                  </Badge>
                  <p className="text-gray-300">Your discipline forge grows stronger each day</p>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="w-full h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white font-black text-xl border-2 border-blue-400/50 shadow-2xl transition-all duration-500 uppercase tracking-wider relative overflow-hidden group"
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    {isCheckingIn ? (
                      <motion.div 
                        className="flex items-center gap-4 relative z-10"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <motion.div 
                          className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="text-center">
                          <div className="text-lg">⚔️ FORGING DESTINY ⚔️</div>
                          <div className="text-sm opacity-90">Your legend unfolds...</div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center gap-4 relative z-10"
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        >
                          <Swords className="h-8 w-8 text-white drop-shadow-lg" />
                        </motion.div>
                        <div className="text-center">
                          <div className="text-xl tracking-widest">⚔️ DECLARE VICTORY ⚔️</div>
                          <div className="text-sm opacity-90 tracking-wide">Claim your daily triumph</div>
                        </div>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                <div className="text-sm text-gray-400">Next Reward</div>
                <div className="font-bold text-white">
                  {nextMilestone - currentStreak} days
                </div>
              </div>
              <div className="text-center">
                <Target className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <div className="text-sm text-gray-400">Milestone</div>
                <div className="font-bold text-white">{nextMilestone} days</div>
              </div>
              <div className="text-center">
                <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                <div className="text-sm text-gray-400">Potential</div>
                <div className="font-bold text-white">
                  +{10 + Math.max(0, currentStreak) * 5} tokens
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

export default EnhancedCheckInFlow