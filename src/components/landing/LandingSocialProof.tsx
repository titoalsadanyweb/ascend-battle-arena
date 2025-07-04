
import React from 'react'
import { motion } from 'framer-motion'

const stats = [
  { value: '500+', label: 'Warriors Fighting' },
  { value: '10K+', label: 'Victories Declared' },
  { value: '95%', label: 'Feel More Confident' }
]

export const LandingSocialProof = () => {
  return (
    <motion.div 
      className="bg-card border border-primary/20 rounded-xl p-8 mb-16 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-6">Join the Community</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                index === 0 ? 'text-primary' : 
                index === 1 ? 'text-secondary' : 
                'text-accent'
              }`}>
                {stat.value}
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
