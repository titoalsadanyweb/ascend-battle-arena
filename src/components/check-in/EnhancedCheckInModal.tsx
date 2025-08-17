import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useCheckIn } from "@/lib/hooks/useCheckIn"
import { Shield, Heart, Zap, Brain, Smile, Frown, Meh, Battery, BatteryLow, User } from 'lucide-react'

interface EnhancedCheckInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentStreak: number
}

type MoodType = 'excellent' | 'good' | 'neutral' | 'struggling' | 'difficult'
type EnergyType = 'high' | 'medium' | 'low'
type StatusType = 'victory' | 'defeat'

const moodOptions = [
  { value: 'excellent', label: 'Excellent', icon: Smile, color: 'text-green-500', bgColor: 'bg-green-50 border-green-200' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-50 border-yellow-200' },
  { value: 'struggling', label: 'Struggling', icon: Frown, color: 'text-orange-500', bgColor: 'bg-orange-50 border-orange-200' },
  { value: 'difficult', label: 'Very Difficult', icon: Frown, color: 'text-red-500', bgColor: 'bg-red-50 border-red-200' }
]

const energyOptions = [
  { value: 'high', label: 'High Energy', icon: Battery, color: 'text-green-500', bgColor: 'bg-green-50 border-green-200' },
  { value: 'medium', label: 'Medium', icon: Battery, color: 'text-yellow-500', bgColor: 'bg-yellow-50 border-yellow-200' },
  { value: 'low', label: 'Low Energy', icon: BatteryLow, color: 'text-red-500', bgColor: 'bg-red-50 border-red-200' }
]

const EnhancedCheckInModal: React.FC<EnhancedCheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentStreak
}) => {
  const [step, setStep] = useState<'status' | 'mood' | 'reflection'>('status')
  const [status, setStatus] = useState<StatusType>('victory')
  const [mood, setMood] = useState<MoodType | null>(null)
  const [energy, setEnergy] = useState<EnergyType | null>(null)
  const [reflection, setReflection] = useState('')
  const { checkIn, isCheckingIn } = useCheckIn()

  const handleStatusSelect = (selectedStatus: StatusType) => {
    setStatus(selectedStatus)
    setStep('mood')
  }

  const handleMoodEnergySelect = () => {
    if (mood && energy) {
      if (status === 'defeat') {
        setStep('reflection')
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    try {
      await checkIn({ 
        status, 
        mood: mood as string, 
        energy: energy as string, 
        reflection: reflection || undefined 
      })
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Check-in failed:', error)
    }
  }

  const resetForm = () => {
    setStep('status')
    setStatus('victory')
    setMood(null)
    setEnergy(null)
    setReflection('')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Day {currentStreak + 1} Check-in
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">How did today go?</h3>
                <p className="text-sm text-muted-foreground">Choose your battle outcome</p>
              </div>
              
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleStatusSelect('victory')}
                    variant="outline"
                    className="w-full h-16 bg-green-50 border-green-200 hover:bg-green-100 text-green-800"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-semibold">Victory</div>
                        <div className="text-sm">Successfully resisted temptation</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleStatusSelect('defeat')}
                    variant="outline"
                    className="w-full h-16 bg-red-50 border-red-200 hover:bg-red-100 text-red-800"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-semibold">Setback</div>
                        <div className="text-sm">Had a relapse, need to regroup</div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">How are you feeling?</h3>
                <p className="text-sm text-muted-foreground">Track your mood and energy</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Mood Today
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {moodOptions.map((option) => (
                      <motion.div 
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setMood(option.value as MoodType)}
                          variant="outline"
                          className={`w-full h-12 ${option.bgColor} ${
                            mood === option.value ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <option.icon className={`h-4 w-4 ${option.color}`} />
                            <span className="text-sm">{option.label}</span>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Energy Level
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {energyOptions.map((option) => (
                      <motion.div 
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setEnergy(option.value as EnergyType)}
                          variant="outline"
                          className={`w-full h-12 ${option.bgColor} ${
                            energy === option.value ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <option.icon className={`h-4 w-4 ${option.color}`} />
                            <span className="text-xs">{option.label}</span>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('status')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleMoodEnergySelect}
                  disabled={!mood || !energy}
                  className="flex-1"
                >
                  {status === 'defeat' ? 'Next' : 'Complete Check-in'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Regroup Mission</h3>
                <p className="text-sm text-muted-foreground">
                  Reflect on what happened and plan your next move
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    What triggered this setback? (Optional)
                  </label>
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Reflect on the situation, what you learned, and how to move forward..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">Recovery Plan</h4>
                  <p className="text-sm text-blue-700">
                    Your streak will reset, but this is part of the journey. 
                    Focus on today and tomorrow's victory.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('mood')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCheckingIn}
                  className="flex-1"
                >
                  {isCheckingIn ? 'Processing...' : 'Submit & Regroup'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default EnhancedCheckInModal