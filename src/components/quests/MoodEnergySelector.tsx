
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Heart, Sparkles, Battery, BatteryLow } from 'lucide-react'
import { motion } from 'framer-motion'

interface MoodEnergySelectorProps {
  onSelect: (mood: string, energy: string) => void
  onSkip: () => void
  className?: string
}

const moodOptions = [
  { value: 'calm', label: 'Calm', emoji: '😌', icon: Heart, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'energized', label: 'Energized', emoji: '⚡', icon: Zap, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'curious', label: 'Curious', emoji: '🤔', icon: Brain, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'reflective', label: 'Reflective', emoji: '💭', icon: Sparkles, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'motivated', label: 'Motivated', emoji: '🔥', icon: Zap, color: 'bg-orange-100 text-orange-800 border-orange-200' },
]

const energyOptions = [
  { value: 'low', label: 'Low Energy', emoji: '🔋', icon: BatteryLow, color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'medium', label: 'Medium Energy', emoji: '🔋🔋', icon: Battery, color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'high', label: 'High Energy', emoji: '🔋🔋🔋', icon: Zap, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
]

const MoodEnergySelector: React.FC<MoodEnergySelectorProps> = ({
  onSelect,
  onSkip,
  className = ''
}) => {
  const [selectedMood, setSelectedMood] = React.useState<string>('')
  const [selectedEnergy, setSelectedEnergy] = React.useState<string>('')

  const handleSubmit = () => {
    if (selectedMood && selectedEnergy) {
      onSelect(selectedMood, selectedEnergy)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">How are you feeling right now?</CardTitle>
          <CardDescription>
            This helps us find the perfect quest for your current state
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Your mood:</h3>
            <div className="grid grid-cols-2 gap-2">
              {moodOptions.map((mood) => {
                const IconComponent = mood.icon
                return (
                  <Button
                    key={mood.value}
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    className={`h-auto p-3 justify-start ${
                      selectedMood === mood.value ? mood.color : 'hover:' + mood.color
                    }`}
                    onClick={() => setSelectedMood(mood.value)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mood.emoji}</span>
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{mood.label}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Energy Selection */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Your energy level:</h3>
            <div className="grid grid-cols-1 gap-2">
              {energyOptions.map((energy) => {
                const IconComponent = energy.icon
                return (
                  <Button
                    key={energy.value}
                    variant={selectedEnergy === energy.value ? "default" : "outline"}
                    className={`h-auto p-3 justify-start ${
                      selectedEnergy === energy.value ? energy.color : 'hover:' + energy.color
                    }`}
                    onClick={() => setSelectedEnergy(energy.value)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{energy.emoji}</span>
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{energy.label}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || !selectedEnergy}
              className="flex-1"
            >
              Find My Quest
            </Button>
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default MoodEnergySelector
