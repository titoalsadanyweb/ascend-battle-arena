
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Flame, Star, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuestProgressProps {
  completedToday: boolean
  weeklyProgress: number
  monthlyProgress: number
  currentStreak: number
  questsThisWeek: number
  questsThisMonth: number
  className?: string
}

const QuestProgress: React.FC<QuestProgressProps> = ({
  completedToday,
  weeklyProgress,
  monthlyProgress,
  currentStreak,
  questsThisWeek,
  questsThisMonth,
  className = ''
}) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <CardTitle className="text-lg">Quest Progress</CardTitle>
        </div>
        <CardDescription>
          Track your daily quest achievements
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Today's Status - Improved Design */}
        <motion.div 
          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
            completedToday 
              ? 'bg-green-50 border-green-200 shadow-sm' 
              : 'bg-gray-50 border-gray-200'
          }`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              completedToday ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {completedToday ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Today's Quest</span>
              <p className="text-sm text-gray-600">
                {completedToday ? 'Completed successfully!' : 'Ready when you are'}
              </p>
            </div>
          </div>
          <Badge 
            variant={completedToday ? "default" : "secondary"}
            className={`px-3 py-1 font-medium ${
              completedToday 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {completedToday ? "✅ Complete" : "⏳ Pending"}
          </Badge>
        </motion.div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">This Week</span>
            </div>
            <span className="text-sm font-medium text-gray-600">{questsThisWeek}/7</span>
          </div>
          <Progress value={weeklyProgress} className="h-2.5" />
          <p className="text-xs text-gray-500">
            {Math.round(weeklyProgress)}% weekly progress
          </p>
        </div>

        {/* Monthly Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <Trophy className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">This Month</span>
            </div>
            <span className="text-sm font-medium text-gray-600">{questsThisMonth}/30</span>
          </div>
          <Progress value={monthlyProgress} className="h-2.5" />
          <p className="text-xs text-gray-500">
            {Math.round(monthlyProgress)}% monthly progress
          </p>
        </div>

        {/* Current Streak - Enhanced Design */}
        <motion.div 
          className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-amber-200"
          initial={{ scale: 1 }}
          animate={{ 
            scale: currentStreak > 0 ? [1, 1.02, 1] : 1,
            boxShadow: currentStreak > 0 ? [
              '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '0 8px 15px -3px rgba(251, 191, 36, 0.3)',
              '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            ] : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 2, repeat: currentStreak > 0 ? Infinity : 0 }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Quest Streak</span>
                <p className="text-sm text-orange-700">
                  {currentStreak === 0 ? 'Start your journey!' : 'Keep the momentum!'}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-white border-orange-300 text-orange-700 font-bold px-3 py-1.5"
            >
              {currentStreak} days
            </Badge>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-2 right-2 opacity-10">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default QuestProgress
