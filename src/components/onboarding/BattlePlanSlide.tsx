
import React from 'react'
import { motion } from 'framer-motion'
import { Sword, Users, Target, Shield, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssessmentData } from '@/pages/BattleAssessmentPage'

interface BattlePlanSlideProps {
  assessmentData: AssessmentData
  onComplete: () => void
  isLoading: boolean
}

const BattlePlanSlide: React.FC<BattlePlanSlideProps> = ({ assessmentData, onComplete, isLoading }) => {
  const { threatLevel, recoveryTimeEstimate } = assessmentData

  const battlePlan = [
    {
      icon: Target,
      title: "Daily Victory Protocol",
      description: "Check in every day to build your streak. Small daily wins create unstoppable momentum.",
      color: "text-green-400"
    },
    {
      icon: Users,
      title: "Ally Network Deployment",
      description: "Connect with battle-tested warriors who understand your fight. Mutual accountability saves lives.",
      color: "text-blue-400"
    },
    {
      icon: Sword,
      title: "Quest System Activation",
      description: "Complete daily micro-challenges designed to build healthy habits and coping strategies.",
      color: "text-purple-400"
    },
    {
      icon: Shield,
      title: "Defense Matrix Setup",
      description: "Learn to identify triggers and deploy countermeasures before the enemy can strike.",
      color: "text-primary"
    }
  ]

  const getPersonalizedMessage = () => {
    if (threatLevel >= 80) {
      return "Your battle is intense, but warriors before you have faced similar odds and emerged victorious. We'll fight this together, one day at a time."
    }
    if (threatLevel >= 60) {
      return "This is a significant challenge, but you have everything needed for victory. Your commitment to change is already a powerful weapon."
    }
    if (threatLevel >= 40) {
      return "You're in a strong position for recovery. With consistent effort and the right support, victory is well within reach."
    }
    return "You have excellent foundations for success. Let's build unbreakable momentum and create lasting change together."
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
          />
          <Trophy className="h-20 w-20 text-primary mx-auto relative z-10" />
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Your <span className="text-primary">Battle Plan</span> is Ready
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Welcome to the ranks, warrior. Your personalized strategy has been forged. 
          Ready to create your account and begin the fight?
        </p>
      </motion.div>

      {/* Battle Plan Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {battlePlan.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Personalized Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg p-8 max-w-3xl mx-auto"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Sword className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-primary">Personal Message from Command</h3>
          <p className="text-foreground italic text-lg leading-relaxed">
            "{getPersonalizedMessage()}"
          </p>
          <div className="border-t border-primary/30 pt-4">
            <p className="text-muted-foreground text-sm">
              <strong>Mission Duration:</strong> {Math.ceil(recoveryTimeEstimate / 7)} weeks estimated
              <br />
              <strong>Challenge Level:</strong> {threatLevel}% - Strategy adapted accordingly
              <br />
              <strong>Support Level:</strong> Maximum - You're never fighting alone
            </p>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="bg-card border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-foreground mb-3">🚀 Ready to Create Your Account?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Your assessment is complete. Click below to join the arena and begin your first day of victory.
          </p>
          
          <Button
            onClick={onComplete}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 font-bold px-8 py-3"
          >
            <Shield className="h-5 w-5 mr-2" />
            Create Account & Enter Arena
          </Button>
        </div>

        <p className="text-muted-foreground text-xs max-w-xl mx-auto">
          By creating an account, you're joining thousands of warriors on the same journey. 
          Your data is protected and your identity remains private within our secure community.
        </p>
      </motion.div>
    </div>
  )
}

export default BattlePlanSlide
