
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowLeft } from 'lucide-react'
import { useQuests } from '@/lib/hooks/useQuests'
import { motion } from 'framer-motion'

interface QuestSwapperProps {
  currentQuest: any
  onQuestSelected: (quest: any) => void
  onCancel: () => void
  mood?: string
  energy?: string
}

// Helper function to safely parse tags
const parseTags = (tags: any): string[] => {
  if (!tags) return []
  
  // If it's already an array, return it
  if (Array.isArray(tags)) {
    return tags
  }
  
  // If it's a string, try to parse as JSON first
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (e) {
      // If JSON parse fails, treat as comma-separated string
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }
  }
  
  return []
}

const QuestSwapper: React.FC<QuestSwapperProps> = ({
  currentQuest,
  onQuestSelected,
  onCancel,
  mood = 'any',
  energy = 'any'
}) => {
  const [isSwapping, setIsSwapping] = useState(false)
  const [alternativeQuests, setAlternativeQuests] = useState<any[]>([])

  const { swapQuest } = useQuests()

  const handleSwapQuest = async () => {
    setIsSwapping(true)
    try {
      // Call swapQuest with correct parameters (object with properties)
      const result = await new Promise<any>((resolve, reject) => {
        swapQuest(
          { 
            currentQuestId: currentQuest.id, 
            mood, 
            energy 
          },
          {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error)
          }
        )
      })
      
      // Set alternatives from the swap result
      setAlternativeQuests(result?.alternatives || [])
    } catch (error) {
      console.error('Error swapping quest:', error)
    } finally {
      setIsSwapping(false)
    }
  }

  if (alternativeQuests.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Swap Your Quest</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <CardDescription>
            Get a different quest that matches your current mood and energy level. You can swap once per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSwapQuest}
            disabled={isSwapping}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSwapping ? 'animate-spin' : ''}`} />
            {isSwapping ? 'Finding alternatives...' : 'Show Alternative Quests'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Choose Your Quest</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <CardDescription>
            Select from these alternative quests that match your preferences:
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {alternativeQuests.map((quest) => {
          const questTags = parseTags(quest.tags)
          
          return (
            <Card 
              key={quest.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 hover:border-primary"
              onClick={() => onQuestSelected(quest)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {quest.type}
                    </Badge>
                    {quest.estimated_minutes && (
                      <Badge variant="outline" className="text-xs">
                        {quest.estimated_minutes}m
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      quest.difficulty_level <= 2 ? 'text-green-600' :
                      quest.difficulty_level <= 3 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}
                  >
                    Level {quest.difficulty_level}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  {quest.text_prompt}
                </p>
                {questTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {questTags.slice(0, 2).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 text-center">
            Or keep your original quest:
          </p>
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => onQuestSelected(currentQuest)}
          >
            Keep Original Quest
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default QuestSwapper
