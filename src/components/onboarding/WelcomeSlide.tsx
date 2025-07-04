
import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Swords, Target } from 'lucide-react'

interface WelcomeSlideProps {
  onNext?: () => void
}

const WelcomeSlide: React.FC<WelcomeSlideProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
        <Shield className="h-24 w-24 text-primary mx-auto relative z-10" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-4xl font-bold text-foreground">
          Welcome to <span className="text-primary">Ascend Arena</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your personal battleground for conquering destructive habits and achieving self-mastery
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
      >
        <div className="bg-card p-6 rounded-lg border border-primary/20">
          <Target className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Daily Victories</h3>
          <p className="text-muted-foreground text-sm">Track your progress with daily check-ins and build unstoppable momentum</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-primary/20">
          <Swords className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Battle Allies</h3>
          <p className="text-muted-foreground text-sm">Connect with warriors fighting the same battles for mutual support</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-primary/20">
          <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Quest System</h3>
          <p className="text-muted-foreground text-sm">Complete daily quests to develop healthy habits and coping strategies</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-2xl mx-auto"
      >
        <p className="text-foreground font-medium">
          ⚔️ This assessment will help us understand your battle and create a personalized strategy for victory
        </p>
      </motion.div>
    </div>
  )
}

export default WelcomeSlide
