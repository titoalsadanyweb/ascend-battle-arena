
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Target, Trophy, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/AuthProvider'

interface ReflectionPromptProps {
  context: 'victory' | 'regroup' | 'contract_complete' | 'streak_milestone' | 'general'
  streak?: number
  onComplete?: (reflection: string) => void
  className?: string
}

const getContextIcon = (context: string) => {
  switch (context) {
    case 'victory': return <Trophy className="h-5 w-5 text-amber-500" />
    case 'regroup': return <Heart className="h-5 w-5 text-blue-500" />
    case 'contract_complete': return <Target className="h-5 w-5 text-green-500" />
    case 'streak_milestone': return <Star className="h-5 w-5 text-purple-500" />
    default: return <Heart className="h-5 w-5 text-gray-500" />
  }
}

const getContextColor = (context: string) => {
  switch (context) {
    case 'victory': return 'border-amber-200 bg-amber-50'
    case 'regroup': return 'border-blue-200 bg-blue-50'
    case 'contract_complete': return 'border-green-200 bg-green-50'
    case 'streak_milestone': return 'border-purple-200 bg-purple-50'
    default: return 'border-gray-200 bg-gray-50'
  }
}

const getContextTitle = (context: string) => {
  switch (context) {
    case 'victory': return 'Celebrate Your Victory'
    case 'regroup': return 'Regroup & Reflect'
    case 'contract_complete': return 'Contract Reflection'
    case 'streak_milestone': return 'Milestone Reflection'
    default: return 'Daily Reflection'
  }
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({
  context,
  streak = 0,
  onComplete,
  className = ''
}) => {
  const [prompt, setPrompt] = useState<any>(null)
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchReflectionPrompt()
  }, [context, streak])

  const fetchReflectionPrompt = async () => {
    try {
      setIsLoading(true)
      
      const { data: prompts, error } = await supabase
        .from('reflection_prompts')
        .select('*')
        .eq('context_type', context)
        .eq('is_active', true)
        .lte('min_streak', streak)
        .gte('max_streak', streak)

      if (error) {
        console.error('Error fetching reflection prompt:', error)
        return
      }

      if (prompts && prompts.length > 0) {
        // Select random prompt from available ones
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
        setPrompt(randomPrompt)
      }
    } catch (error) {
      console.error('Error in fetchReflectionPrompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!reflection.trim() || !user) return

    setIsSubmitting(true)
    try {
      // Save reflection to user's journal/completions
      const { error } = await supabase
        .from('quest_completions')
        .insert({
          user_id: user.id,
          quest_id: null, // This is a reflection, not tied to a specific quest
          date_local: new Date().toISOString().split('T')[0],
          submission_text: reflection,
          tokens_awarded: 0,
          shared_with_ally: false
        })

      if (!error) {
        onComplete?.(reflection)
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!prompt) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${getContextColor(context)} ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getContextIcon(context)}
            <CardTitle className="text-lg">{getContextTitle(context)}</CardTitle>
          </div>
          <CardDescription className="text-base font-medium text-gray-700">
            {prompt.prompt_text}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Take a moment to reflect... there's no right or wrong answer."
            className="min-h-[100px] border-0 bg-white/80 resize-none"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {reflection.length} characters
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!reflection.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ReflectionPrompt
