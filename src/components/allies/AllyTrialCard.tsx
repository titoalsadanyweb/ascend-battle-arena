import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Users, MessageSquare, Target, Star, ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { AllyTrial, useAllyTrials } from '@/lib/hooks/useAllyTrials'

interface AllyTrialCardProps {
  trial: AllyTrial
}

const AllyTrialCard: React.FC<AllyTrialCardProps> = ({ trial }) => {
  const { upgradeTrial, isUpgrading } = useAllyTrials()

  const daysRemaining = Math.max(0, 
    Math.ceil((new Date(trial.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  )
  
  const progressPercentage = Math.min(100, ((7 - daysRemaining) / 7) * 100)
  const canUpgrade = trial.interaction_count >= 3 && trial.shared_activities >= 1

  const handleUpgrade = () => {
    upgradeTrial({ trialId: trial.id })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Trial Period
            </CardTitle>
            <Badge variant={daysRemaining > 2 ? "default" : "destructive"}>
              {daysRemaining} days left
            </Badge>
          </div>
          <Progress value={progressPercentage} className="w-full h-2" />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {trial.ally_profile?.username?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{trial.ally_profile?.username || 'Unknown'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-3 w-3" />
                Compatibility: {trial.compatibility_score}%
                {trial.ally_profile?.trust_score && (
                  <>
                    <span>•</span>
                    <span>Trust: {trial.ally_profile.trust_score}/100</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-semibold">{trial.interaction_count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Interactions</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold">{trial.shared_activities}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shared Activities</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Trial Progress:
            </div>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${trial.interaction_count >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-2 h-2 rounded-full ${trial.interaction_count >= 3 ? 'bg-green-600' : 'bg-muted'}`} />
                Have at least 3 meaningful interactions ({trial.interaction_count}/3)
              </div>
              <div className={`flex items-center gap-2 ${trial.shared_activities >= 1 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-2 h-2 rounded-full ${trial.shared_activities >= 1 ? 'bg-green-600' : 'bg-muted'}`} />
                Complete a shared activity together ({trial.shared_activities}/1)
              </div>
            </div>
          </div>

          {canUpgrade ? (
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <ArrowUp className="h-4 w-4" />
              {isUpgrading ? 'Upgrading...' : 'Upgrade to Full Ally'}
            </Button>
          ) : (
            <div className="text-center p-3 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Keep interacting to unlock the upgrade option!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AllyTrialCard