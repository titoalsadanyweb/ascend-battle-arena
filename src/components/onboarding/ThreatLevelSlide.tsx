
import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Shield, Zap, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { AssessmentData } from '@/pages/BattleAssessmentPage'

interface ThreatLevelSlideProps {
  assessmentData: AssessmentData
  updateAssessmentData: (key: keyof AssessmentData, value: any) => void
}

const ThreatLevelSlide: React.FC<ThreatLevelSlideProps> = ({ assessmentData }) => {
  const { threatLevel, recoveryTimeEstimate } = assessmentData

  const getThreatLevelColor = () => {
    if (threatLevel >= 80) return 'text-red-500'
    if (threatLevel >= 60) return 'text-orange-500'
    if (threatLevel >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getThreatLevelLabel = () => {
    if (threatLevel >= 80) return 'Intense'
    if (threatLevel >= 60) return 'Challenging'
    if (threatLevel >= 40) return 'Moderate'
    return 'Manageable'
  }

  const getThreatMessage = () => {
    if (threatLevel >= 80) {
      return "This is an intense battle, but thousands of warriors have conquered similar challenges. You have everything needed for victory."
    }
    if (threatLevel >= 60) {
      return "A challenging fight lies ahead, but with the right strategy and our proven system, transformation is absolutely achievable."
    }
    if (threatLevel >= 40) {
      return "You're facing a moderate challenge. With consistent effort and our support, you'll see significant progress quickly."
    }
    return "You have excellent foundations for rapid success. Let's build unstoppable momentum together."
  }

  const getTimelineText = () => {
    if (recoveryTimeEstimate <= 7) {
      return `${recoveryTimeEstimate} days`
    }
    return `${Math.ceil(recoveryTimeEstimate / 7)} weeks`
  }

  const getMotivationalScore = () => {
    // Always show an encouraging score between 85-95%
    return Math.max(85, Math.min(95, 100 - (threatLevel * 0.1)))
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <AlertTriangle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          <span className="text-primary">Battle Assessment</span> Complete
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Based on your responses, we've created your personalized victory roadmap with realistic timelines.
        </p>
      </motion.div>

      {/* Threat Level Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-card border border-primary/30 rounded-xl p-8 max-w-2xl mx-auto"
      >
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Challenge Level</h3>
            <div className={`text-6xl font-bold ${getThreatLevelColor()}`}>
              {threatLevel}%
            </div>
            <div className={`text-xl font-medium ${getThreatLevelColor()}`}>
              {getThreatLevelLabel()}
            </div>
          </div>

          <div className="space-y-3">
            <Progress 
              value={threatLevel} 
              className="h-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easy Mode</span>
              <span>Boss Battle</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recovery Timeline */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        <div className="bg-card border border-blue-500/30 rounded-lg p-6 text-center">
          <Clock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h4 className="font-bold text-foreground mb-2">Victory Timeline</h4>
          <div className="text-2xl font-bold text-blue-400">
            {getTimelineText()}
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            To breakthrough results
          </p>
        </div>

        <div className="bg-card border border-green-500/30 rounded-lg p-6 text-center">
          <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h4 className="font-bold text-foreground mb-2">Victory Potential</h4>
          <div className="text-2xl font-bold text-green-400">
            {getMotivationalScore().toFixed(0)}%
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            With our proven system
          </p>
        </div>

        <div className="bg-card border border-purple-500/30 rounded-lg p-6 text-center">
          <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <h4 className="font-bold text-foreground mb-2">Support Level</h4>
          <div className="text-2xl font-bold text-purple-400">
            Maximum
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            Community + AI guidance
          </p>
        </div>
      </motion.div>

      {/* Personalized Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg p-6 max-w-3xl mx-auto"
      >
        <div className="text-center">
          <h3 className="text-xl font-bold text-primary mb-4">
            🎯 Your Personal Victory Message
          </h3>
          <p className="text-foreground text-lg leading-relaxed">
            {getThreatMessage()}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <div className="bg-card border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-muted-foreground text-sm">
            <span className="text-primary font-medium">⚡ Next Step:</span> We'll create your personalized battle plan 
            with daily missions designed specifically for your timeline and challenge level.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ThreatLevelSlide
