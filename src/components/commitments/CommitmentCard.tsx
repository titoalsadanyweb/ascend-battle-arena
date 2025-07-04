
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Swords, Shield, Calendar, Coins, Crown } from 'lucide-react'
import { Commitment } from '@/lib/hooks/useCommitments'
import { formatDistanceToNow, format } from 'date-fns'

interface CommitmentCardProps {
  commitment: Commitment
  onCancel?: (id: string) => void
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment, onCancel }) => {
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
    ? Math.max(0, Math.ceil((new Date(commitment.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(commitment.duration_days === 14 || commitment.duration_days === 30) && <Crown className="h-5 w-5 text-amber-500" />}
            <Swords className="h-5 w-5 text-primary" />
            {commitment.duration_days} Day Contract ({getDurationLabel(commitment.duration_days)})
          </div>
          <Badge variant="secondary" className={`${statusColors[commitment.status]} text-white`}>
            {statusLabels[commitment.status]}
          </Badge>
        </CardTitle>
        <CardDescription>
          {commitment.status === 'active' && daysRemaining > 0 
            ? `${daysRemaining} days remaining`
            : `${commitment.duration_days}-day commitment battle`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(commitment.start_date), 'MMM d')} - {format(new Date(commitment.end_date), 'MMM d')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>{commitment.stake_amount} SIT</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Potential reward:</span>
            <span className="font-medium text-green-600">
              +{getRewardPercentage(commitment.duration_days)}% ({Math.floor(commitment.stake_amount * (getRewardPercentage(commitment.duration_days) / 100))} SIT bonus)
            </span>
          </div>

          {commitment.ally_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Witnessed by Battle Ally</span>
            </div>
          )}

          {commitment.success_streak > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Success streak: </span>
              <span className="font-medium text-green-600">{commitment.success_streak}</span>
            </div>
          )}

          {commitment.status === 'active' && onCancel && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onCancel(commitment.id)}
                className="w-full"
              >
                End Contract Early
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CommitmentCard
