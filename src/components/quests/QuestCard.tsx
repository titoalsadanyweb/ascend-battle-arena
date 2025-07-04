
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Star, CheckCircle2, AlertCircle } from 'lucide-react'
import { useQuests } from '@/lib/hooks/useQuests'

const QuestCard: React.FC = () => {
  const { todayQuest, isLoading, error, completeQuest, isCompleting } = useQuests()
  
  const [submissionText, setSubmissionText] = useState('')
  const [shareWithAlly, setShareWithAlly] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleCompleteQuest = async () => {
    if (!todayQuest) return
    
    setSubmitError(null)
    
    try {
      completeQuest({
        questId: todayQuest.id,
        submissionText: submissionText.trim() || undefined,
        shareWithAlly
      })
      
      // Reset form state on success
      setSubmissionText('')
      setShareWithAlly(false)
    } catch (error: any) {
      console.error('Quest completion error:', error)
      setSubmitError(error.message || 'Failed to complete quest. Please try again.')
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 5: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Novice'
      case 2: return 'Apprentice'
      case 3: return 'Veteran'
      case 4: return 'Expert'
      case 5: return 'Master'
      default: return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load today's quest. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!todayQuest) return null

  if (todayQuest.completed) {
    return (
      <Card className="w-full border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Daily Quest Completed
            </CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              +{todayQuest.completion_details?.tokens_awarded || 5} Valor Shards
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-3">{todayQuest.text_prompt}</p>
          {todayQuest.completion_details?.submission_text && (
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Your reflection:</p>
              <p className="text-gray-800">{todayQuest.completion_details.submission_text}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Quest</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(todayQuest.difficulty_level)}>
              {getDifficultyLabel(todayQuest.difficulty_level)}
            </Badge>
            {todayQuest.estimated_minutes && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {todayQuest.estimated_minutes}m
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="capitalize">
          {todayQuest.type.replace('_', ' ')} • Complete to earn 5 Valor Shards
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-gray-800 leading-relaxed">{todayQuest.text_prompt}</p>
        </div>

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div>
            <label htmlFor="quest-reflection" className="text-sm font-medium text-gray-700 mb-2 block">
              Your reflection (optional)
            </label>
            <Textarea
              id="quest-reflection"
              placeholder="Share your thoughts, insights, or how this quest made you feel..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="min-h-[80px]"
              disabled={isCompleting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="share-ally"
              checked={shareWithAlly}
              onCheckedChange={(checked) => setShareWithAlly(checked as boolean)}
              disabled={isCompleting}
            />
            <label htmlFor="share-ally" className="text-sm text-gray-600">
              Share this completion with my Battle Ally
            </label>
          </div>

          <Button 
            onClick={handleCompleteQuest}
            disabled={isCompleting}
            className="w-full"
          >
            {isCompleting ? 'Completing...' : 'Complete Quest'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuestCard
