
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Heart, 
  Zap, 
  Target, 
  Users, 
  BookOpen, 
  Palette, 
  Activity,
  Clock,
  Star,
  Sparkles,
  Crown,
  Gem
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import QuestStartButton from './QuestStartButton'
import QuestCompletionFlow from './QuestCompletionFlow'
import QuestProgressTracker from './QuestProgressTracker'
import QuestSuccessAnimation from './QuestSuccessAnimation'

interface EnhancedQuestCardProps {
  quest: any
  onComplete: (submissionText?: string, shareWithAlly?: boolean, mood?: string, energy?: string) => void
  isCompleting: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'mindfulness': return <Brain className="h-4 w-4" />
    case 'reflection': return <Heart className="h-4 w-4" />
    case 'physical': return <Zap className="h-4 w-4" />
    case 'activity': return <Target className="h-4 w-4" />
    case 'social': return <Users className="h-4 w-4" />
    case 'learning': return <BookOpen className="h-4 w-4" />
    case 'creative': return <Palette className="h-4 w-4" />
    case 'gratitude': return <Heart className="h-4 w-4" />
    default: return <Activity className="h-4 w-4" />
  }
}

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'uncommon': return <Star className="h-3 w-3 text-blue-500" />
    case 'rare': return <Sparkles className="h-3 w-3 text-purple-500" />
    case 'epic': return <Crown className="h-3 w-3 text-amber-500" />
    case 'legendary': return <Gem className="h-3 w-3 text-red-500" />
    default: return null
  }
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'uncommon': return 'border-blue-200 bg-blue-50'
    case 'rare': return 'border-purple-200 bg-purple-50'
    case 'epic': return 'border-amber-200 bg-amber-50'
    case 'legendary': return 'border-red-200 bg-red-50'
    default: return 'border-gray-200 bg-white'
  }
}

// Helper function to safely parse quest tags
const parseQuestTags = (tags: any): string[] => {
  if (!tags) return []
  
  // If it's already an array, return it
  if (Array.isArray(tags)) return tags
  
  // If it's a string, try to parse as JSON first
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // If JSON parsing fails, treat as comma-separated string
      return tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }
  }
  
  return []
}

const EnhancedQuestCard: React.FC<EnhancedQuestCardProps> = ({
  quest,
  onComplete,
  isCompleting
}) => {
  const [questStatus, setQuestStatus] = useState<'not_started' | 'in_progress' | 'completing' | 'completed'>(
    quest.completed ? 'completed' : 'not_started'
  )
  const [questStartedAt, setQuestStartedAt] = useState<string | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const handleStartQuest = () => {
    setQuestStatus('in_progress')
    setQuestStartedAt(new Date().toISOString())
  }

  const handleCompleteQuest = (data: {
    submissionText?: string
    shareWithAlly?: boolean
    mood?: string
    energy?: string
  }) => {
    onComplete(data.submissionText, data.shareWithAlly, data.mood, data.energy)
    setShowSuccessAnimation(true)
  }

  const handleSuccessAnimationClose = () => {
    setShowSuccessAnimation(false)
    setQuestStatus('completed')
  }

  const handleCancelCompletion = () => {
    setQuestStatus('in_progress')
  }

  const questTags = parseQuestTags(quest.tags)

  if (quest.completed || questStatus === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${getRarityColor(quest.rarity)} transition-all duration-300`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(quest.type)}
                <Badge variant="secondary" className="text-xs">
                  {quest.type}
                </Badge>
                {getRarityIcon(quest.rarity)}
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✅ Completed
              </Badge>
            </div>
            <CardTitle className="text-lg">{quest.text_prompt}</CardTitle>
          </CardHeader>
          {quest.completion_details?.submission_text && (
            <CardContent>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Your Reflection:</span>
                <p className="text-sm text-gray-600 mt-1">{quest.completion_details.submission_text}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${getRarityColor(quest.rarity)} transition-all duration-300 hover:shadow-lg`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(quest.type)}
                <Badge variant="secondary" className="text-xs capitalize">
                  {quest.type}
                </Badge>
                {getRarityIcon(quest.rarity)}
                {quest.estimated_minutes && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {quest.estimated_minutes}m
                  </Badge>
                )}
              </div>
            </div>
            
            <CardTitle className="text-lg leading-tight">{quest.text_prompt}</CardTitle>
            
            {questTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {questTags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <QuestProgressTracker 
              status={questStatus === 'completing' ? 'in_progress' : questStatus}
              startedAt={questStartedAt}
              estimatedMinutes={quest.estimated_minutes}
              onContinue={() => setQuestStatus('completing')}
            />

            <AnimatePresence mode="wait">
              {questStatus === 'not_started' && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QuestStartButton
                    onStart={handleStartQuest}
                    estimatedMinutes={quest.estimated_minutes}
                    difficulty={quest.difficulty_level}
                  />
                </motion.div>
              )}

              {questStatus === 'in_progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <p className="text-sm text-gray-600 mb-4">
                    Take your time with this quest. When you're ready, complete it below.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setQuestStatus('completing')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Ready to Complete Quest 🎯
                  </motion.button>
                </motion.div>
              )}

              {questStatus === 'completing' && (
                <motion.div
                  key="completing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <QuestCompletionFlow
                    quest={quest}
                    onComplete={handleCompleteQuest}
                    onCancel={handleCancelCompletion}
                    isCompleting={isCompleting}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showSuccessAnimation && (
          <QuestSuccessAnimation
            tokensEarned={5}
            questType={quest.type}
            onClose={handleSuccessAnimationClose}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default EnhancedQuestCard
