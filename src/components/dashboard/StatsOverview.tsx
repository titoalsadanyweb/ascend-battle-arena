
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy, Coins, Shield } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from 'framer-motion'
import { useDashboard } from "@/lib/hooks/useDashboard"

interface StatsOverviewProps {
  currentStreak: number
  bestStreak: number
  tokenBalance: number
  isLoading: boolean
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  currentStreak: propCurrentStreak,
  bestStreak: propBestStreak,
  tokenBalance: propTokenBalance,
  isLoading: propIsLoading
}) => {
  const { dashboardData, isLoading: dashboardLoading } = useDashboard()

  // Use dashboard data if available, otherwise fallback to props
  const currentStreak = dashboardData?.current_streak ?? propCurrentStreak
  const bestStreak = dashboardData?.best_streak ?? propBestStreak
  const tokenBalance = dashboardData?.token_balance ?? propTokenBalance
  const isLoading = dashboardLoading || propIsLoading

  console.log('StatsOverview data:', { currentStreak, bestStreak, tokenBalance, isLoading })
  const stats = [
    {
      title: "VICTORY STREAK",
      value: currentStreak,
      suffix: "DAYS",
      description: "Days of continuous mastery",
      icon: Flame,
      gradient: "from-ascend-primary to-ascend-secondary",
      textColor: "text-ascend-primary",
      border: "border-ascend-primary/20",
      bg: "bg-ascend-primary/5"
    },
    {
      title: "BEST STREAK", 
      value: bestStreak,
      suffix: "DAYS",
      description: "Your legendary achievement",
      icon: Trophy,
      gradient: "from-ascend-warning to-ascend-secondary",
      textColor: "text-ascend-warning",
      border: "border-ascend-warning/20",
      bg: "bg-ascend-warning/5"
    },
    {
      title: "VALOR SHARDS",
      value: tokenBalance,
      suffix: "",
      description: "Currency of champions",
      icon: Coins,
      gradient: "from-ascend-secondary to-ascend-accent",
      textColor: "text-ascend-secondary",
      border: "border-ascend-secondary/20",
      bg: "bg-ascend-secondary/5"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className={`bg-gradient-card border-0 ${stat.border} backdrop-blur-sm hover:shadow-lg transition-all duration-500 group overflow-hidden relative`}>
            {/* Subtle texture */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:30px_30px]"></div>
            
            {/* Badge symbol */}
            <div className="absolute top-3 right-3 opacity-10">
              <Shield className="h-6 w-6 text-ascend-primary" />
            </div>
            
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black text-foreground tracking-widest uppercase">
                    {stat.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {stat.description}
                  </CardDescription>
                </div>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.bg}`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading ? (
                <Skeleton className="h-10 w-24 bg-muted/50" />
              ) : (
                <motion.div 
                  className={`text-4xl font-black ${stat.textColor} tracking-tight`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                >
                  {stat.value.toLocaleString()} 
                  {stat.suffix && <span className="text-lg text-muted-foreground ml-1">{stat.suffix}</span>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsOverview
