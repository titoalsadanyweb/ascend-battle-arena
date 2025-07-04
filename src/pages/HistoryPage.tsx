import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/AuthProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Calendar, Clock, Scroll } from 'lucide-react'
import { format } from 'date-fns'

interface QuestCompletion {
  id: string
  date_local: string
  submission_text: string | null
  tokens_awarded: number
  completed_at: string
  shared_with_ally: boolean
  quest: {
    text_prompt: string
    type: string
    difficulty_level: number
  }
}

const HistoryPage = () => {
  const { user } = useAuth()

  const { data: questHistory, isLoading, error } = useQuery({
    queryKey: ['quest-history', user?.id],
    queryFn: async (): Promise<QuestCompletion[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('quest_completions')
        .select(`
          id,
          date_local,
          submission_text,
          tokens_awarded,
          completed_at,
          shared_with_ally,
          quest:quests(
            text_prompt,
            type,
            difficulty_level
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 4: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 5: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
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
      <AppLayout>
        <div className="min-h-screen gradient-main p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-muted/20 rounded-lg"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen gradient-main p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="text-red-600">
                  Failed to load quest history. Please try again.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  const totalReflections = questHistory?.filter(q => q.submission_text)?.length || 0
  const totalTokensEarned = questHistory?.reduce((sum, q) => sum + q.tokens_awarded, 0) || 0

  return (
    <AppLayout>
      <div className="min-h-screen gradient-main">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 gradient-card backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-4 right-4 opacity-10">
                <BookOpen className="h-8 w-8 text-ascend-primary transform -rotate-12" />
              </div>
              
              <CardHeader>
                <CardTitle className="text-foreground text-2xl font-black flex items-center gap-3 tracking-wide uppercase">
                  <Scroll className="h-7 w-7 text-ascend-secondary" />
                  QUEST CHRONICLES
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium uppercase tracking-wide">
                  Your journey of self-discovery and reflection
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-ascend-primary">
                      {questHistory?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                      Quests Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-ascend-secondary">
                      {totalReflections}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                      Reflections Written
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-500">
                      {totalTokensEarned}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                      Valor Shards Earned
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quest History */}
          {questHistory && questHistory.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {questHistory.map((completion, index) => (
                    <motion.div
                      key={completion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="border-0 gradient-card backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(completion.date_local), 'MMMM d, yyyy')}
                                <Separator orientation="vertical" className="h-4" />
                                <Clock className="h-4 w-4" />
                                {format(new Date(completion.completed_at), 'h:mm a')}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getDifficultyColor(completion.quest.difficulty_level)}>
                                  {getDifficultyLabel(completion.quest.difficulty_level)}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {completion.quest.type.replace('_', ' ')}
                                </Badge>
                                <Badge variant="secondary">
                                  +{completion.tokens_awarded} Valor Shards
                                </Badge>
                                {completion.shared_with_ally && (
                                  <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
                                    Shared with Ally
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
                            <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Quest Prompt:</div>
                            <p className="text-gray-800 dark:text-gray-200">{completion.quest.text_prompt}</p>
                          </div>

                          {completion.submission_text && (
                            <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                              <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Your Reflection:</div>
                              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {completion.submission_text}
                              </p>
                            </div>
                          )}

                          {!completion.submission_text && (
                            <div className="text-center py-4 text-muted-foreground italic">
                              No reflection was written for this quest
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-12"
            >
              <Card className="border-0 gradient-card backdrop-blur-sm">
                <CardContent className="p-8">
                  <Scroll className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Quest History Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Complete your first daily quest to start building your chronicle of self-discovery!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default HistoryPage
