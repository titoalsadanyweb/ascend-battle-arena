
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Shield, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export const LandingHero = () => {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Shield className="h-20 w-20 text-primary mx-auto shield-glow" />
      </motion.div>
      <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6">
        Battle for 
        <span className="text-primary block md:inline md:ml-4">
          Self-Mastery
        </span>
      </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
        Daily victories earn Valor Shards. Find a Battle Ally. Win your war against unwanted habits.
        Join warriors aged 15-25 in the ultimate quest for self-control.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/assessment">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 text-lg shadow-lg">
              Join the Battle
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Link>
        <Link to="/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-3 text-lg">
              I'm Already a Warrior
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}
