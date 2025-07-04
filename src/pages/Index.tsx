
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsOverview from '@/components/dashboard/StatsOverview'
import CheckInSection from '@/components/dashboard/CheckInSection'
import AdvancedQuestSection from '@/components/dashboard/AdvancedQuestSection'
import JourneyMap from '@/components/journey/JourneyMap'
import AllySection from '@/components/dashboard/AllySection'
import RegroupMissionCard from '@/components/commitments/RegroupMissionCard'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { useProfile } from '@/lib/hooks/useProfile'
import { useCommitments } from '@/lib/hooks/useCommitments'
import { motion } from 'framer-motion'

const Index = () => {
  const { dashboardData, isLoading: dashboardLoading } = useDashboard()
  const { profile, isLoading: profileLoading } = useProfile()
  const { regroupMissions, completeRegroupMission, isCompletingRegroup } = useCommitments()

  const isLoading = dashboardLoading || profileLoading

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <DashboardHeader />
        
        <motion.div 
          className="grid gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Stats Overview */}
          <StatsOverview 
            currentStreak={dashboardData?.current_streak || 0}
            bestStreak={dashboardData?.best_streak || 0}
            tokenBalance={dashboardData?.token_balance || 0}
            isLoading={isLoading}
          />

          {/* Regroup Missions - Show prominently if available */}
          {regroupMissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {regroupMissions.map((mission) => (
                <RegroupMissionCard
                  key={mission.id}
                  mission={mission}
                  onComplete={completeRegroupMission}
                  isCompleting={isCompletingRegroup}
                />
              ))}
            </motion.div>
          )}

          {/* Check-in Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CheckInSection 
              hasCheckedInToday={dashboardData?.has_checked_in_today || false}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Advanced Quest Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AdvancedQuestSection />
          </motion.div>

          {/* Ally Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AllySection />
          </motion.div>

          {/* Journey Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <JourneyMap 
              checkInsHistory={dashboardData?.check_ins_history || []}
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  )
}

export default Index
