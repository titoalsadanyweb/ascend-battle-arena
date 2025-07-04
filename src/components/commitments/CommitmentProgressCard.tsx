
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Swords, Shield, Calendar, Coins, Crown, Clock, Users } from 'lucide-react'
import { Commitment } from '@/lib/hooks/useCommitments'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'

interface CommitmentProgressCardProps {
  commitment: Commitment
  onCancel?: (id: string) => void
  onViewDetails?: (commitment: Commitment) => void
}

const CommitmentProgressCard: React.FC<CommitmentProgressCardProps> = ({ 
  commitment, 
  onCancel,
  onViewDetails 
}) => {
  const statusColors = {
    pending: 'bg-yellow-500',
    active: 'bg-blue-500',
    succeeded: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-gray-500',
  }

  const statusLabels = {
    pending: 'Pending',
    active: 'Active Battle',
    succeeded: 'Victory',
    failed: 'Defeat',
    cancelled: 'Cancelled',
  }

  const getRewardPercentage = (days: number) => {
    switch (days) {
      case 1: return 10
      case 3: return 20
      case 7: return 30
      case 14: return 40
      case 30: return 50
      default: return 20
    }
  }

  const getDurationLabel = (days: number) => {
    switch (days) {
      case 1: return 'Starter'
      case 3: return 'Warrior'
      case 7: return 'Champion'
      case 14: return 'Legend'
      case 30: return 'Master'
      default: return 'Custom'
    }
  }

  const daysRemaining = commitment.status === 'active' 
    ? Math.max(0, differenceInDays(new Date(commitment.end_date), new Date()))
    : 0

  const totalDays = commitment.duration_days
  const daysCompleted = totalDays - daysRemaining
  const progressPercentage = commitment.status === 'active' 
    ? Math.min(100, (daysCompleted / totalDays) * 100)
    : commitment.status === 'succeeded' ? 100 : 0

  const isEliteContract = commitment.duration_days >= 14
  const hasAllyStake = commitment.matched_stake_amount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className={`border-primary/20 ${commitment.status === 'active' ? 'ring-2 ring-blue-200' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEliteContract && <Crown className="h-5 w-5 text-amber-500" />}
              <Swords className="h-5 w-5 text-primary" />
              <span>{commitment.duration_days} Day Contract</span>
              <Badge variant="outline" className="text-xs">
                {getDurationLabel(commitment.duration_days)}
              </Badge>
            </div>
            <Badge variant="secondary" className={`${statusColors[commitment.status]} text-white`}>
              {statusLabels[commitment.status]}
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(commitment.start_date), 'MMM d')} - {format(new Date(commitment.end_date), 'MMM d')}
              </span>
            </div>
            {hasAllyStake && (
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="h-4 w-4" />
                <span className="text-xs">Ally Matched</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Progress for active contracts */}
            {commitment.status === 'active' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{daysRemaining} days remaining</span>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  Day {daysCompleted} of {totalDays}
                </div>
              </div>
            )}

            {/* Stakes and rewards info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span>Your Stake</span>
                </div>
                <div className="font-medium">{commitment.stake_amount} SIT</div>
                {hasAllyStake && (
                  <div className="text-xs text-blue-600">
                    + {commitment.matched_stake_amount} SIT (Ally)
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Potential Reward</span>
                </div>
                <div className="font-medium text-green-600">
                  +{getRewardPercentage(commitment.duration_days)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.floor(commitment.stake_amount * (getRewardPercentage(commitment.duration_days) / 100))} SIT bonus
                </div>
              </div>
            </div>

            {/* Failure history for failed contracts */}
            {commitment.status === 'failed' && commitment.failure_count > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm text-red-800">
                  <strong>Failure #{commitment.failure_count}</strong>
                  {commitment.failure_count === 1 && ' - 100% stake lost'}
                  {commitment.failure_count === 2 && ' - 50% stake lost (reduced penalty)'}
                  {commitment.failure_count >= 3 && ' - 25% stake lost (minimal penalty)'}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  Complete Regroup Missions to recover 30% of lost tokens
                </div>
              </div>
            )}

            {/* Success streak for succeeded contracts */}
            {commitment.status === 'succeeded' && commitment.success_streak > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-800">
                  <strong>Success Streak: {commitment.success_streak}</strong>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Building momentum! Longer contracts now available.
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              {commitment.status === 'active' && onCancel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCancel(commitment.id)}
                  className="flex-1"
                >
                  End Contract Early
                </Button>
              )}
              
              {onViewDetails && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewDetails(commitment)}
                  className="flex-1"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CommitmentProgressCard
