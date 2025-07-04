
import React from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const OnboardingHeader = () => {
  return (
    <CardHeader className="text-center">
      <motion.div 
        className="flex justify-center mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <Shield className="h-12 w-12 text-primary shield-glow" />
      </motion.div>
      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Complete Your Setup
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        Choose your warrior name and timezone to begin your battle
      </CardDescription>
    </CardHeader>
  )
}
