
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export const LandingFinalCTA = () => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Begin Your Quest?</h3>
      <p className="text-muted-foreground mb-8 text-lg">
        Your future self will thank you for taking this first step today.
      </p>
      <Link to="/assessment">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 py-4 text-xl shadow-lg">
            Start Battle Assessment
            <Shield className="ml-3 h-6 w-6" />
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  )
}
