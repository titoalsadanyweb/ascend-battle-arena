
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Heart, Brain, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuestCompletionFlowProps {
  quest: any
  onComplete: (data: {
    submissionText?: string
    shareWithAlly?: boolean
    mood?: string
    energy?: string
  }) => void
  onCancel: () => void
  isCompleting: boolean
}

const QuestCompletionFlow: React.FC<QuestCompletionFlowProps> = ({
  quest,
  onComplete,
  onCancel,
  isCompleting
}) => {
  const [step, setStep] = useState(1)
  const [submissionText, setSubmissionText] = useState('')
  const [shareWithAlly, setShareWithAlly] = useState(false)
  const [mood, setMood] = useState('')
  const [energy, setEnergy] = useState('')

  const requiresReflection = quest.type === 'reflection' || quest.type === 'creative'
  const totalSteps = requiresReflection ? 3 : 2

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleComplete = () => {
    onComplete({
      submissionText: submissionText.trim() || undefined,
      shareWithAlly,
      mood: mood || undefined,
      energy: energy || undefined
    })
  }

  const canProceedFromStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return mood && energy
      case 2:
        return !requiresReflection || submissionText.trim().length >= 10
      default:
        return true
    }
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Complete Quest
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Step {step} of {totalSteps}
          </Badge>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-sm font-medium text-gray-800">{quest.text_prompt}</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="font-medium text-gray-800 mb-3">How are you feeling right now?</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calm">😌 Calm</SelectItem>
                      <SelectItem value="energized">⚡ Energized</SelectItem>
                      <SelectItem value="focused">🎯 Focused</SelectItem>
                      <SelectItem value="reflective">💭 Reflective</SelectItem>
                      <SelectItem value="motivated">🔥 Motivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Energy</Label>
                  <Select value={energy} onValueChange={setEnergy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🔋 Low</SelectItem>
                      <SelectItem value="medium">🔋🔋 Medium</SelectItem>
                      <SelectItem value="high">🔋🔋🔋 High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && requiresReflection && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="font-medium text-gray-800 mb-3">Share your reflection</h3>
                <p className="text-sm text-gray-600">
                  Take a moment to reflect on this quest. What did you learn or experience?
                </p>
              </div>

              <div>
                <Textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Write your thoughts, insights, or experience..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {submissionText.length} characters (min 10)
                  </span>
                  {submissionText.length >= 10 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === totalSteps && (
            <motion.div
              key="stepFinal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h3 className="font-medium text-gray-800 mb-3">Ready to complete?</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800 font-medium">
                    🎉 You'll earn 5 Valor Shards for completing this quest!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="share-ally"
                  checked={shareWithAlly}
                  onCheckedChange={(checked) => setShareWithAlly(checked as boolean)}
                />
                <Label htmlFor="share-ally" className="text-sm">
                  Share this completion with my Battle Ally
                </Label>
              </div>

              {submissionText && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-xs font-medium text-gray-600">Your reflection:</Label>
                  <p className="text-sm text-gray-800 mt-1">
                    {submissionText.substring(0, 150)}
                    {submissionText.length > 150 && '...'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-4">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceedFromStep(step)}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={isCompleting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? 'Completing...' : 'Complete Quest! 🎉'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuestCompletionFlow
