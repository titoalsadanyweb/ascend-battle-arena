
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Coins, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { RegroupMission } from '@/lib/hooks/useCommitments'

interface RegroupMissionCardProps {
  mission: RegroupMission
  onComplete: (missionId: string, reflectionText: string) => void
  isCompleting?: boolean
}

const RegroupMissionCard: React.FC<RegroupMissionCardProps> = ({
  mission,
  onComplete,
  isCompleting = false
}) => {
  const [reflection, setReflection] = useState('')

  const handleSubmit = () => {
    if (reflection.trim().length < 10) {
      return
    }
    onComplete(mission.id, reflection.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900">Regroup Mission</CardTitle>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
              <Coins className="h-3 w-3 mr-1" />
              +{mission.tokens_awarded} Recovery
            </Badge>
          </div>
          <CardDescription className="text-amber-700">
            Complete this reflection to recover some of your lost honor
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-100 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                Reflect on what led to the contract failure and write one lesson learned and one action for today.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-900">
              Your Reflection (minimum 10 characters)
            </label>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did I learn from this setback? What specific action will I take today to get back on track?"
              className="min-h-[100px] border-amber-200 focus:border-amber-400"
              maxLength={500}
            />
            <div className="text-xs text-amber-600">
              {reflection.length}/500 characters
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={reflection.trim().length < 10 || isCompleting}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isCompleting ? 'Completing Mission...' : 'Complete Recovery Mission'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RegroupMissionCard
