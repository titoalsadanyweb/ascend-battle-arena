
import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingHeader } from './OnboardingHeader'
import { OnboardingForm } from './OnboardingForm'

const OnboardingFlow = () => {
  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="gradient-card border-primary/20 backdrop-blur-sm">
          <OnboardingHeader />
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default OnboardingFlow
