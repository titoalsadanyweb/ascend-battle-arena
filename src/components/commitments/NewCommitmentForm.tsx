import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useCommitments } from '@/lib/hooks/useCommitments'
import { useProfile } from '@/lib/hooks/useProfile'
import { Shield, Coins, Calendar, Users, Target, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/hooks/use-toast'

interface NewCommitmentFormProps {
  onClose?: () => void
  allies?: Array<{ id: string; username: string }>
}

const NewCommitmentForm: React.FC<NewCommitmentFormProps> = ({ onClose, allies = [] }) => {
  const { createCommitment, isCreating } = useCommitments()
  const { profile } = useProfile()
  
  const [duration, setDuration] = useState<number>(7)
  const [stakeAmount, setStakeAmount] = useState<number>(100)
  const [selectedAlly, setSelectedAlly] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const durationOptions = [
    { value: 1, label: '1 Day', difficulty: 'Beginner', reward: 10 },
    { value: 3, label: '3 Days', difficulty: 'Easy', reward: 15 },
    { value: 7, label: '7 Days', difficulty: 'Medium', reward: 30 },
    { value: 14, label: '14 Days', difficulty: 'Hard', reward: 40 },
    { value: 30, label: '30 Days', difficulty: 'Expert', reward: 50 },
  ]

  const currentOption = durationOptions.find(opt => opt.value === duration)
  const potentialReward = stakeAmount + Math.floor(stakeAmount * (currentOption?.reward || 20) / 100)
  const userBalance = profile?.token_balance || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (stakeAmount > userBalance) {
      toast({
        title: "Insufficient Valor Shards",
        description: `You need ${stakeAmount} Valor Shards but only have ${userBalance}.`,
        variant: "destructive"
      })
      return
    }

    try {
      await createCommitment({
        duration,
        stakeAmount,
        allyId: selectedAlly || undefined
      })
      
      toast({
        title: "Battle Contract Created!",
        description: `Your ${duration}-day commitment begins now. Victory rewards ${potentialReward} Valor Shards!`
      })
      
      if (onClose) onClose()
    } catch (error) {
      console.error('Failed to create commitment:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FORGE BATTLE CONTRACT
          </CardTitle>
          <CardDescription className="text-base">
            Stake your honor and commit to victory. Failure teaches, success rewards.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duration Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Battle Duration
              </Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your commitment duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="outline" className="ml-2">
                          {option.difficulty}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentOption && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge variant="outline">{currentOption.difficulty}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Bonus reward:</span>
                    <span className="text-primary font-semibold">+{currentOption.reward}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stake Amount */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Honor Stake
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(parseInt(e.target.value) || 0)}
                  min="10"
                  max={userBalance}
                  step="10"
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  💎 Shards
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available: {userBalance.toLocaleString()} 💎</span>
                <span className="text-primary font-semibold">
                  Potential reward: {potentialReward.toLocaleString()} 💎
                </span>
              </div>
              {stakeAmount > userBalance && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Insufficient Valor Shards
                </div>
              )}
            </div>

            {/* Ally Selection */}
            {allies.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Battle Ally (Optional)
                </Label>
                <Select value={selectedAlly} onValueChange={setSelectedAlly}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a battle ally for mutual accountability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Ally (Solo Battle)</SelectItem>
                    {allies.map((ally) => (
                      <SelectItem key={ally.id} value={ally.id}>
                        {ally.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Battle Oath (Optional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your commitment, goals, or motivations..."
                className="min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreating || stakeAmount > userBalance || stakeAmount < 10}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Forging Contract...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Begin Battle ({stakeAmount} 💎)
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default NewCommitmentForm