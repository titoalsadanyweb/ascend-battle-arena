
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Swords, Shield, AlertTriangle, Crown } from 'lucide-react'
import { useCommitments } from '@/lib/hooks/useCommitments'
import { useAllies } from '@/lib/hooks/useAllies'
import { useProfile } from '@/lib/hooks/useProfile'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/AuthProvider'

interface CommitmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CommitmentModal: React.FC<CommitmentModalProps> = ({ open, onOpenChange }) => {
  const [duration, setDuration] = useState(3)
  const [stakeAmount, setStakeAmount] = useState(50)
  const [selectedAlly, setSelectedAlly] = useState<string>('')
  const [hasCompleted7Days, setHasCompleted7Days] = useState(false)
  const [hasCompleted14Days, setHasCompleted14Days] = useState(false)
  
  const { createCommitment, isCreating } = useCommitments()
  const { allies } = useAllies()
  const { profile } = useProfile()
  const { user } = useAuth()

  const maxStake = profile ? Math.floor(profile.token_balance * 0.5) : 0

  // Check if user has completed contracts to unlock higher durations
  useEffect(() => {
    const checkPreviousSuccesses = async () => {
      if (!user) return

      try {
        // Check for completed 7-day contracts
        const { data: completed7Days } = await supabase.rpc('check_completed_7_day_contract', {
          p_user_id: user.id
        })
        setHasCompleted7Days(!!completed7Days)

        // Check for completed 14-day contracts using the new function
        const { data: completed14Days } = await supabase.rpc('check_completed_14_day_contract', {
          p_user_id: user.id
        })
        setHasCompleted14Days(!!completed14Days)
      } catch (error) {
        console.log('Error checking previous successes:', error)
        setHasCompleted7Days(false)
        setHasCompleted14Days(false)
      }
    }

    if (open) {
      checkPreviousSuccesses()
    }
  }, [user, open])

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

  const handleSubmit = () => {
    if (stakeAmount > maxStake) {
      return
    }

    createCommitment({
      duration,
      stakeAmount,
      allyId: selectedAlly || undefined,
    })

    onOpenChange(false)
    // Reset form
    setDuration(3)
    setStakeAmount(50)
    setSelectedAlly('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Create Battle Contract
          </DialogTitle>
          <DialogDescription>
            Stake Valor Shards on your commitment. Stay strong to earn rewards!
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Contract Duration</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day (Starter) - +10% bonus</SelectItem>
                <SelectItem value="3">3 Days (Warrior) - +20% bonus</SelectItem>
                <SelectItem value="7">7 Days (Champion) - +30% bonus</SelectItem>
                {hasCompleted7Days && (
                  <SelectItem value="14">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      14 Days (Legend) - +40% bonus
                    </div>
                  </SelectItem>
                )}
                {hasCompleted14Days && (
                  <SelectItem value="30">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      30 Days (Master) - +50% bonus
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {duration === 14 && !hasCompleted7Days && (
              <p className="text-xs text-muted-foreground">
                Complete a 7-day contract first to unlock 14-day contracts
              </p>
            )}
            {duration === 30 && !hasCompleted14Days && (
              <p className="text-xs text-muted-foreground">
                Complete a 14-day contract first to unlock 30-day contracts
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake">Valor Shards Stake</Label>
            <Input
              id="stake"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(parseInt(e.target.value) || 0)}
              max={maxStake}
              min={1}
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {maxStake} SIT (50% of your balance)
            </p>
          </div>

          {allies.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="ally">Battle Witness (Optional)</Label>
              <Select value={selectedAlly} onValueChange={setSelectedAlly}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an ally to witness" />
                </SelectTrigger>
                <SelectContent>
                  {allies.map((ally) => (
                    <SelectItem key={ally.id} value={ally.ally_id}>
                      {ally.ally_profile.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Contract Terms
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Daily check-ins required for {duration} consecutive days</li>
              <li>• Success: Stake returned + {getRewardPercentage(duration)}% bonus</li>
              <li>• Failure: Stake forfeited (progressive penalty system)</li>
              <li>• Recovery missions available after failure</li>
            </ul>
          </div>

          {stakeAmount > maxStake && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Stake amount exceeds maximum allowed
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating || stakeAmount > maxStake || stakeAmount < 1}
            className="gap-2"
          >
            <Swords className="h-4 w-4" />
            {isCreating ? 'Creating...' : 'Begin Battle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CommitmentModal
