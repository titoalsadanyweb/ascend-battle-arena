
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Coins, MessageCircle, Handshake, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

interface AllyInteractionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allyUsername: string
  interactionType: 'tokens' | 'message' | 'challenge' | null
}

const AllyInteractionModal: React.FC<AllyInteractionModalProps> = ({
  open,
  onOpenChange,
  allyUsername,
  interactionType
}) => {
  const [tokenAmount, setTokenAmount] = useState(10)
  const [message, setMessage] = useState('')
  const [challengeType, setChallengeType] = useState('')
  const [challengeDuration, setChallengeDuration] = useState(3)

  const handleSubmit = () => {
    // Handle different interaction types
    switch (interactionType) {
      case 'tokens':
        console.log(`Sending ${tokenAmount} tokens to ${allyUsername}`)
        break
      case 'message':
        console.log(`Sending message to ${allyUsername}: ${message}`)
        break
      case 'challenge':
        console.log(`Proposing ${challengeType} challenge to ${allyUsername} for ${challengeDuration} days`)
        break
    }
    
    onOpenChange(false)
    // Reset form
    setTokenAmount(10)
    setMessage('')
    setChallengeType('')
    setChallengeDuration(3)
  }

  const getModalTitle = () => {
    switch (interactionType) {
      case 'tokens':
        return 'Send Encouragement Tokens'
      case 'message':
        return 'Send Message'
      case 'challenge':
        return 'Propose Joint Challenge'
      default:
        return 'Ally Interaction'
    }
  }

  const getModalIcon = () => {
    switch (interactionType) {
      case 'tokens':
        return <Coins className="h-5 w-5 text-amber-600" />
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />
      case 'challenge':
        return <Handshake className="h-5 w-5 text-green-600" />
      default:
        return <Heart className="h-5 w-5 text-primary" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            Interact with your battle ally <Badge variant="outline">{allyUsername}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {interactionType === 'tokens' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Token Amount</Label>
                <Input
                  id="tokenAmount"
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)}
                  min={1}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">
                  Send encouragement tokens to boost your ally's morale
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenMessage">Optional Message</Label>
                <Textarea
                  id="tokenMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note..."
                  maxLength={200}
                />
              </div>
            </motion.div>
          )}

          {interactionType === 'message' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="messageContent">Message</Label>
                <Textarea
                  id="messageContent"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  maxLength={500}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  {message.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage("Keep pushing forward! You've got this! 💪")}
                >
                  Encouragement
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage("How are you feeling today? I'm here if you need support.")}
                >
                  Check-in
                </Button>
              </div>
            </motion.div>
          )}

          {interactionType === 'challenge' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="challengeType">Challenge Type</Label>
                <Select value={challengeType} onValueChange={setChallengeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select challenge type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meditation">Daily Meditation</SelectItem>
                    <SelectItem value="exercise">Physical Exercise</SelectItem>
                    <SelectItem value="reading">Reading Challenge</SelectItem>
                    <SelectItem value="social">Social Connection</SelectItem>
                    <SelectItem value="creative">Creative Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challengeDuration">Duration (days)</Label>
                <Select 
                  value={challengeDuration.toString()} 
                  onValueChange={(value) => setChallengeDuration(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challengeMessage">Challenge Description</Label>
                <Textarea
                  id="challengeMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the challenge and what you'll do together..."
                  maxLength={300}
                />
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              (interactionType === 'tokens' && tokenAmount <= 0) ||
              (interactionType === 'message' && message.trim().length === 0) ||
              (interactionType === 'challenge' && (!challengeType || message.trim().length === 0))
            }
            className="gap-2"
          >
            {getModalIcon()}
            {interactionType === 'tokens' && 'Send Tokens'}
            {interactionType === 'message' && 'Send Message'}
            {interactionType === 'challenge' && 'Propose Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AllyInteractionModal
