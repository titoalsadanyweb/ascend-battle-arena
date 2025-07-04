
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, RefreshCw, Settings, Sparkles, BookOpen } from 'lucide-react'
import { useQuests } from '@/lib/hooks/useQuests'
import { useProfile } from '@/lib/hooks/useProfile'
import EnhancedQuestCard from '@/components/quests/EnhancedQuestCard'
import QuestSwapper from '@/components/quests/QuestSwapper'
import ReflectionPrompt from '@/components/quests/ReflectionPrompt'
import MoodEnergySelector from '@/components/quests/MoodEnergySelector'
import QuestProgress from '@/components/quests/QuestProgress'
import QuestJournal from '@/components/quests/QuestJournal'
import { motion, AnimatePresence } from 'framer-motion'

const EnhancedQuestSection: React.FC = () => {
  const { todayQuest, completeQuest, isCompleting, refreshQuestWithPreferences, isRefreshing } = useQuests()
  const { profile } = useProfile()
  const [showSwapper, setShowSwapper] = useState(false)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [currentQuest, setCurrentQuest] = useState(todayQuest)
  const [showReflection, setShowReflection] = useState(false)
  const [dailySwapUsed, setDailySwapUsed] = useState(false)

  // Update current quest when todayQuest changes
  React.useEffect(() => {
    if (todayQuest && !currentQuest) {
      setCurrentQuest(todayQuest)
    }
  }, [todayQuest, currentQuest])

  const handleQuestComplete = async (
    submissionText?: string, 
    shareWithAlly?: boolean, 
    mood?: string, 
    energy?: string
  ) => {
    if (!currentQuest) return

    console.log('Quest completion handler called with:', {
      questId: currentQuest.id,
      submissionText,
      shareWithAlly,
      mood,
      energy
    })

    completeQuest({
      questId: currentQuest.id,
      submissionText,
      shareWithAlly,
      mood,
      energy
    })

    // Show reflection prompt after completing quest
    setTimeout(() => {
      setShowReflection(true)
    }, 2000)
  }

  const handleMoodEnergySelect = (mood: string, energy: string) => {
    refreshQuestWithPreferences({ mood, energy })
    setShowMoodSelector(false)
  }

  const handleQuestSwap = (newQuest: any) => {
    setCurrentQuest(newQuest)
    setShowSwapper(false)
    setDailySwapUsed(true)
  }

  const getReflectionContext = () => {
    if (!profile) return 'general'
    
    if (profile.current_streak === 0) return 'regroup'
    if (profile.current_streak >= 30) return 'streak_milestone'
    if (profile.current_streak >= 7) return 'victory'
    return 'general'
  }

  // Calculate progress metrics
  const questsThisWeek = Math.min(profile?.current_streak || 0, 7)
  const questsThisMonth = Math.min(profile?.current_streak || 0, 30)
  const weeklyProgress = (questsThisWeek / 7) * 100
  const monthlyProgress = (questsThisMonth / 30) * 100

  if (showJournal) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setShowJournal(false)}
          className="mb-4"
        >
          ← Back to Quest
        </Button>
        <QuestJournal />
      </div>
    )
  }

  if (showMoodSelector) {
    return (
      <Card>
        <CardContent className="p-6">
          <MoodEnergySelector
            onSelect={handleMoodEnergySelect}
            onSkip={() => setShowMoodSelector(false)}
          />
        </CardContent>
      </Card>
    )
  }

  if (showSwapper) {
    return (
      <Card>
        <CardContent className="p-6">
          <QuestSwapper
            currentQuest={currentQuest || todayQuest}
            onQuestSelected={handleQuestSwap}
            onCancel={() => setShowSwapper(false)}
          />
        </CardContent>
      </Card>
    )
  }

  if (!currentQuest && !todayQuest) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <CardTitle>Daily Quest</CardTitle>
              </div>
              <CardDescription>
                Complete daily quests to earn Valor Shards and build discipline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your daily quest...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <QuestProgress
          completedToday={false}
          weeklyProgress={weeklyProgress}
          monthlyProgress={monthlyProgress}
          currentStreak={profile?.current_streak || 0}
          questsThisWeek={questsThisWeek}
          questsThisMonth={questsThisMonth}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>Daily Quest</CardTitle>
                  {(currentQuest || todayQuest)?.rarity && (currentQuest || todayQuest)?.rarity !== 'common' && (
                    <Badge variant="secondary" className="capitalize flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {(currentQuest || todayQuest)?.rarity}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJournal(true)}
                    title="View Quest Journal"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoodSelector(true)}
                    disabled={(currentQuest || todayQuest)?.completed}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {!dailySwapUsed && !(currentQuest || todayQuest)?.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSwapper(true)}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                {(currentQuest || todayQuest)?.completed 
                  ? "Quest completed! Check back tomorrow for a new challenge."
                  : "Start your daily quest when you're ready. Take your time and reflect on the experience."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedQuestCard
                quest={currentQuest || todayQuest}
                onComplete={handleQuestComplete}
                isCompleting={isCompleting}
              />
            </CardContent>
          </Card>
        </div>

        <QuestProgress
          completedToday={(currentQuest || todayQuest)?.completed || false}
          weeklyProgress={weeklyProgress}
          monthlyProgress={monthlyProgress}
          currentStreak={profile?.current_streak || 0}
          questsThisWeek={questsThisWeek}
          questsThisMonth={questsThisMonth}
        />
      </div>

      <AnimatePresence>
        {showReflection && (currentQuest || todayQuest)?.completed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ReflectionPrompt
              context={getReflectionContext()}
              streak={profile?.current_streak || 0}
              onComplete={() => setShowReflection(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedQuestSection
