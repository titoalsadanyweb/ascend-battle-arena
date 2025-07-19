import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCheckIn } from "@/lib/hooks/useCheckIn"
import { useDashboard } from "@/lib/hooks/useDashboard"
import { Shield, CheckCircle, Clock, Flame } from 'lucide-react'

interface EnhancedCheckInFlowProps {
  hasCheckedInToday: boolean
  currentStreak: number
  bestStreak: number
  tokenBalance: number
}

const EnhancedCheckInFlow: React.FC<EnhancedCheckInFlowProps> = ({
  hasCheckedInToday: propHasCheckedIn,
  currentStreak: propCurrentStreak,
  bestStreak: propBestStreak,
  tokenBalance: propTokenBalance
}) => {
  const { checkIn, isCheckingIn } = useCheckIn()
  const { dashboardData, refetch } = useDashboard()
  const [showCelebration, setShowCelebration] = useState(false)
  const [timeUntilNext, setTimeUntilNext] = useState('')

  // Use dashboard data if available, otherwise fallback to props
  const hasCheckedInToday = dashboardData?.has_checked_in_today ?? propHasCheckedIn
  const currentStreak = dashboardData?.current_streak ?? propCurrentStreak
  const bestStreak = dashboardData?.best_streak ?? propBestStreak
  const tokenBalance = dashboardData?.token_balance ?? propTokenBalance

  console.log('EnhancedCheckInFlow data:', { hasCheckedInToday, currentStreak, bestStreak, tokenBalance })

  // Calculate time until next check-in (next day at midnight)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const timeDiff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilNext(`${hours}h ${minutes}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    try {
      await checkIn({ status: 'victory' })
      setShowCelebration(true)
      // Force refetch immediately after check-in
      setTimeout(async () => {
        await refetch()
        setShowCelebration(false)
      }, 1500)
    } catch (error) {
      console.error('Check-in failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 1.5 }}
              className="bg-card border border-primary/20 rounded-2xl p-8 text-center shadow-2xl"
            >
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
              >
                🏆
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Victory Declared!</h2>
              <p className="text-muted-foreground">Streak updated • Tokens earned</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Check-in Card */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Status Display */}
            <div className="space-y-3">
              <motion.div
                animate={ hasCheckedInToday ? { 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                } : {}}
                transition={{ duration: 2, repeat: hasCheckedInToday ? Infinity : 0, repeatDelay: 3 }}
              >
                {hasCheckedInToday ? (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                ) : (
                  <Shield className="h-16 w-16 text-primary mx-auto" />
                )}
              </motion.div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {hasCheckedInToday ? 'Victory Declared!' : 'Declare Victory'}
                </h3>
                <p className="text-muted-foreground">
                  {hasCheckedInToday 
                    ? `Day ${currentStreak} complete • Next in ${timeUntilNext}`
                    : 'Claim your daily progress'
                  }
                </p>
              </div>
            </div>

            {/* Streak & Stats */}
            <div className="flex justify-center items-center gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current</div>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{bestStreak}</div>
                <div className="text-sm text-muted-foreground">Best</div>
              </div>
            </div>

            {/* Action Button or Next Check-in */}
            {hasCheckedInToday ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">Today's Victory Claimed</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Next check-in available in {timeUntilNext}</span>
                </div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  {isCheckingIn ? (
                    <motion.div 
                      className="flex items-center gap-3"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.div 
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Declaring Victory...
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5" />
                      Declare Victory Today
                    </div>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Token Display */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="text-2xl font-bold text-yellow-500">{tokenBalance.toLocaleString()}</span>
              <span>Valor Shards</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedCheckInFlow