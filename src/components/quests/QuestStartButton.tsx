
import React from 'react'
import { Button } from '@/components/ui/button'
import { Play, Clock, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuestStartButtonProps {
  onStart: () => void
  estimatedMinutes?: number
  difficulty: number
  isLoading?: boolean
  disabled?: boolean
}

const QuestStartButton: React.FC<QuestStartButtonProps> = ({
  onStart,
  estimatedMinutes,
  difficulty,
  isLoading = false,
  disabled = false
}) => {
  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < level ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{estimatedMinutes || 5} min</span>
        </div>
        <div className="flex items-center gap-1">
          {getDifficultyStars(difficulty)}
        </div>
      </div>
      
      <Button
        onClick={onStart}
        disabled={isLoading || disabled}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
      >
        <Play className="h-4 w-4 mr-2" />
        {isLoading ? 'Starting...' : 'Start Quest'}
      </Button>
    </motion.div>
  )
}

export default QuestStartButton
