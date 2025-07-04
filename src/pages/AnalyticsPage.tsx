
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { motion } from 'framer-motion'
import { BarChart } from 'lucide-react'
import UserAnalytics from '@/components/analytics/UserAnalytics'

const AnalyticsPage: React.FC = () => {
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
                <BarChart className="h-8 w-8 text-primary" />
                Battle Analytics
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your progress and identify patterns
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <UserAnalytics />
        </motion.div>
      </div>
    </AppLayout>
  )
}

export default AnalyticsPage
