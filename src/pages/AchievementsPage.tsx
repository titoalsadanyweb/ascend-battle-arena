
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import AchievementSystem from '@/components/achievements/AchievementSystem'

const AchievementsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                Battle Achievements
              </h1>
              <p className="text-muted-foreground mt-2">
                Unlock rewards for your victories and milestones
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <AchievementSystem />
        </motion.div>
      </div>
    </AppLayout>
  )
}

export default AchievementsPage
