
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Trophy, TrendingUp, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuestAnalytics } from '@/lib/hooks/useQuestAnalytics'
import { format, parseISO } from 'date-fns'

interface QuestJournalProps {
  className?: string
}

const QuestJournal: React.FC<QuestJournalProps> = ({ className = '' }) => {
  const { analytics, isLoading } = useQuestAnalytics()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Quest Journal</CardTitle>
          </div>
          <CardDescription>Loading your quest insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Quest Journal</CardTitle>
          </div>
          <CardDescription>Complete quests to see your insights here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Start completing quests to build your journal!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Quest Journal</CardTitle>
          </div>
          <Badge variant="secondary" className="font-medium">
            {analytics.totalQuests} Completed
          </Badge>
        </div>
        <CardDescription>
          Your quest patterns and achievements
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quest Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Completion Rate</span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {Math.round(analytics.completionRate)}%
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Avg. Time</span>
            </div>
            <p className="text-lg font-bold text-purple-700">
              {Math.round(analytics.averageCompletionTime)}m
            </p>
          </div>
        </div>

        {/* Favorite Quest Types */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Your Quest Strengths
          </h4>
          <div className="space-y-2">
            {analytics.favoriteTypes.slice(0, 3).map((type, index) => (
              <motion.div
                key={type.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`} />
                  <span className="font-medium capitalize">{type.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{type.count} quests</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(type.percentage)}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mood Patterns */}
        {analytics.moodPatterns.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Mood Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {analytics.moodPatterns.slice(0, 4).map((mood) => (
                <Badge key={mood.mood} variant="outline" className="capitalize">
                  {mood.mood}: {mood.count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-900">Quest Insight</span>
          </div>
          <p className="text-sm text-green-800">
            {analytics.favoriteTypes[0] ? 
              `You excel at ${analytics.favoriteTypes[0].type} quests! Consider challenging yourself with different types to build versatility.` :
              'Complete more quests to unlock personalized insights!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuestJournal
