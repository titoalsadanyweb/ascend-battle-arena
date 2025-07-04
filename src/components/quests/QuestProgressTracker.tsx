
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle2, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuestProgressTrackerProps {
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  estimatedMinutes?: number
  elapsedMinutes?: number
  onContinue?: () => void
}

const QuestProgressTracker: React.FC<QuestProgressTrackerProps> = ({
  status,
  startedAt,
  estimatedMinutes = 5,
  elapsedMinutes = 0,
  onContinue
}) => {
  const progressPercentage = Math.min((elapsedMinutes / estimatedMinutes) * 100, 100)

  if (status === 'not_started') return null

  if (status === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-4"
      >
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Quest Completed!</span>
              <Badge variant="secondary" className="ml-auto">
                +5 Valor Shards
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Quest in Progress</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Clock className="h-3 w-3" />
                <span>{elapsedMinutes}m / {estimatedMinutes}m</span>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            {onContinue && (
              <button
                onClick={onContinue}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Continue quest →
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default QuestProgressTracker
