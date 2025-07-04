
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Target, Trophy, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/hooks/useProfile'
import { useDashboard } from '@/lib/hooks/useDashboard'

const UserAnalytics: React.FC = () => {
  const { profile } = useProfile()
  const { dashboardData } = useDashboard()

  // Mock analytics data (in real app, this would come from API)
  const weeklyData = [
    { day: 'Mon', checkins: 1, quests: 1 },
    { day: 'Tue', checkins: 1, quests: 1 },
    { day: 'Wed', checkins: 0, quests: 0 },
    { day: 'Thu', checkins: 1, quests: 1 },
    { day: 'Fri', checkins: 1, quests: 0 },
    { day: 'Sat', checkins: 1, quests: 1 },
    { day: 'Sun', checkins: 1, quests: 1 }
  ]

  const streakData = [
    { week: 'W1', streak: 3 },
    { week: 'W2', streak: 7 },
    { week: 'W3', streak: 5 },
    { week: 'W4', streak: 12 }
  ]

  const habitData = [
    { name: 'Check-ins', value: 85, color: '#3B82F6' },
    { name: 'Quests', value: 72, color: '#10B981' },
    { name: 'Contracts', value: 60, color: '#F59E0B' }
  ]

  const calculateSuccessRate = () => {
    const total = dashboardData?.check_ins_history?.length || 0
    const successful = dashboardData?.check_ins_history?.filter(c => c.status === 'success').length || 0
    return total > 0 ? Math.round((successful / total) * 100) : 0
  }

  const getStreakTrend = () => {
    const current = profile?.current_streak || 0
    const best = profile?.best_streak || 0
    return current > 0 ? Math.round((current / Math.max(best, 1)) * 100) : 0
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateSuccessRate()}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                {getStreakTrend()}% of best streak
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Valor</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.token_balance || 0}</div>
              <p className="text-xs text-muted-foreground">Shards earned</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.best_streak || 0}</div>
              <p className="text-xs text-muted-foreground">Personal record</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Your check-ins and quest completions this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="checkins" fill="#3B82F6" name="Check-ins" />
                  <Bar dataKey="quests" fill="#10B981" name="Quests" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Streak Progress
              </CardTitle>
              <CardDescription>
                Your streak evolution over the last month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="streak" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Habit Consistency
              </CardTitle>
              <CardDescription>
                Track your consistency across different activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {habitData.map((habit, index) => (
                <div key={habit.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{habit.name}</span>
                    <Badge variant="outline">{habit.value}%</Badge>
                  </div>
                  <Progress value={habit.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Analysis
              </CardTitle>
              <CardDescription>
                When you're most active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Morning</span>
                  <Badge variant="outline">25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Afternoon</span>
                  <Badge variant="outline">45%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Evening</span>
                  <Badge variant="outline">30%</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Best Check-in Time</h4>
                <p className="text-2xl font-bold text-primary">2:30 PM</p>
                <p className="text-xs text-muted-foreground">Based on your patterns</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default UserAnalytics
