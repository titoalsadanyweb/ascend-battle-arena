
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Swords, Shield, AlertTriangle, Crown, Users, Coins } from 'lucide-react'
import { useCommitments } from '@/lib/hooks/useCommitments'
import { useAllies } from '@/lib/hooks/useAllies'
import { useProfile } from '@/lib/hooks/useProfile'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/AuthProvider'

interface EnhancedCommitmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EnhancedCommitmentModal: React.FC<EnhancedCommitmentModalProps> = ({ open, onOpenChange }) => {
  const [duration, setDuration] = useState(3)
  const [stakeAmount, setStakeAmount] = useState(50)
  const [selectedAlly, setSelectedAlly] = useState<string>('')
  const [allyStakeAmount, setAllyStakeAmount] = useState(0)
  const [allowAllyStake, setAllowAllyStake] = useState(false)
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

        // Check for completed 14-day contracts
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

  const getPenaltyInfo = (days: number) => {
    const baseReward = getRewardPercentage(days)
    return {
      firstFailure: 100,
      secondFailure: 50,
      thirdFailure: 25,
      recoveryPercentage: 30,
      baseReward
    }
  }

  const selectedAllyProfile = allies.find(ally => ally.ally_id === selectedAlly)?.ally_profile

  const handleSubmit = () => {
    if (stakeAmount > maxStake) {
      return
    }

    createCommitment({
      duration,
      stakeAmount,
      allyId: selectedAlly || undefined,
      allyStake: allowAllyStake ? allyStakeAmount : 0,
    })

    onOpenChange(false)
    // Reset form
    setDuration(3)
    setStakeAmount(50)
    setSelectedAlly('')
    setAllyStakeAmount(0)
    setAllowAllyStake(false)
  }

  const penaltyInfo = getPenaltyInfo(duration)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Create Enhanced Battle Contract
          </DialogTitle>
          <DialogDescription>
            Stake Valor Shards with advanced penalty/recovery system and optional ally matching
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
                <SelectItem value="1">1 Day (Starter) - +{getRewardPercentage(1)}% bonus</SelectItem>
                <SelectItem value="3">3 Days (Warrior) - +{getRewardPercentage(3)}% bonus</SelectItem>
                <SelectItem value="7">7 Days (Champion) - +{getRewardPercentage(7)}% bonus</SelectItem>
                {hasCompleted7Days && (
                  <SelectItem value="14">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      14 Days (Legend) - +{getRewardPercentage(14)}% bonus
                    </div>
                  </SelectItem>
                )}
                {hasCompleted14Days && (
                  <SelectItem value="30">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      30 Days (Master) - +{getRewardPercentage(30)}% bonus
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake">Your Valor Shards Stake</Label>
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
            <>
              <div className="space-y-2">
                <Label htmlFor="ally">Battle Witness (Optional)</Label>
                <Select value={selectedAlly} onValueChange={setSelectedAlly}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an ally to witness" />
                  </SelectTrigger>
                  <SelectContent>
                    {allies.map((ally) => (
                      <SelectItem key={ally.id} value={ally.ally_id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {ally.ally_profile.username}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAlly && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowAllyStake"
                      checked={allowAllyStake}
                      onCheckedChange={(checked) => setAllowAllyStake(checked === true)}
                    />
                    <Label htmlFor="allowAllyStake" className="text-sm font-medium">
                      Allow ally to match stakes (optional)
                    </Label>
                  </div>
                  
                  {allowAllyStake && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="allyStake" className="text-sm">Suggested Ally Stake</Label>
                      <Input
                        id="allyStake"
                        type="number"
                        value={allyStakeAmount}
                        onChange={(e) => setAllyStakeAmount(parseInt(e.target.value) || 0)}
                        min={0}
                        max={stakeAmount}
                        placeholder="0"
                      />
                      <p className="text-xs text-blue-600">
                        If your ally matches this stake, you both share in success rewards!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Enhanced Contract Terms
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-green-600 mb-1">Success Rewards:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Stake returned + {penaltyInfo.baseReward}% bonus</li>
                  {allowAllyStake && allyStakeAmount > 0 && (
                    <li>• Ally gets stake + 10% bonus</li>
                  )}
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-red-600 mb-1">Failure Penalties:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 1st failure: {penaltyInfo.firstFailure}% stake lost</li>
                  <li>• 2nd failure: {penaltyInfo.secondFailure}% stake lost</li>
                  <li>• 3rd+ failure: {penaltyInfo.thirdFailure}% stake lost</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-2 border-t border-muted">
              <p className="text-xs text-muted-foreground">
                <strong>Recovery System:</strong> After each failure, complete a Regroup Mission 
                to recover {penaltyInfo.recoveryPercentage}% of lost tokens. Failed stakes may be shared with your ally.
              </p>
            </div>
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
            {isCreating ? 'Creating...' : 'Begin Enhanced Battle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EnhancedCommitmentModal
