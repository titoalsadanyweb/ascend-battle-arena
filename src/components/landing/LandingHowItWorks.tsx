
import React from 'react'
import { motion } from 'framer-motion'

const steps = [
  { step: 1, title: 'Join the Arena', description: 'Sign up and choose your warrior identity' },
  { step: 2, title: 'Daily Check-Ins', description: 'Declare victory each day you stay strong' },
  { step: 3, title: 'Find Your Ally', description: 'Partner with another warrior for support' },
  { step: 4, title: 'Win Together', description: 'Build streaks, complete quests, earn rewards' }
]

export const LandingHowItWorks = () => {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <h3 className="text-3xl font-bold text-foreground mb-12">Your Path to Victory</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((item, index) => (
          <motion.div 
            key={item.step}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
          >
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg">
              {item.step}
            </div>
            <h4 className="text-foreground font-semibold mb-2">{item.title}</h4>
            <p className="text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
