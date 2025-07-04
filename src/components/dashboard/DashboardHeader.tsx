
import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Swords } from 'lucide-react'

const DashboardHeader: React.FC = () => {
  return (
    <motion.div 
      className="text-center mb-12 relative"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/3 transform -rotate-45">
          <Shield className="h-20 w-20 text-ascend-primary" />
        </div>
        <div className="absolute top-0 right-1/3 transform rotate-45">
          <Swords className="h-20 w-20 text-ascend-secondary" />
        </div>
      </div>
      
      <div className="relative z-10">
        <motion.h1 
          className="text-6xl font-black bg-gradient-to-r from-ascend-primary via-ascend-secondary to-ascend-accent bg-clip-text text-transparent mb-4 tracking-tighter"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          WAR ROOM
        </motion.h1>
        <motion.div 
          className="flex items-center justify-center gap-3 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-ascend-primary to-transparent"></div>
          <Shield className="h-5 w-5 text-ascend-primary shield-glow" />
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-ascend-primary to-transparent"></div>
        </motion.div>
        <motion.p 
          className="text-muted-foreground text-lg font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-ascend-primary font-bold">MASTER</span> your demons. <span className="text-ascend-secondary font-bold">ASCEND</span> to greatness.
        </motion.p>
      </div>
    </motion.div>
  )
}

export default DashboardHeader
