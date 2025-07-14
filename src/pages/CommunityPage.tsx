
import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { motion } from 'framer-motion'
import { Users, Trophy, Heart, MessageCircle } from 'lucide-react'
import CommunityFeed from '@/components/social/CommunityFeed'
import PostCreator from '@/components/feed/PostCreator'
import EnhancedAllyPanel from '@/components/social/EnhancedAllyPanel'

const CommunityPage = () => {
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
                <Users className="h-8 w-8 text-primary" />
                Community & Allies
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect, support, and celebrate victories together
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Community Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <PostCreator />
            <CommunityFeed />
          </motion.div>

          {/* Ally Panel Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <EnhancedAllyPanel />
            
            {/* Community Stats Card */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Community Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Active Warriors</span>
                  <span className="font-semibold text-green-900">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Contracts Today</span>
                  <span className="font-semibold text-green-900">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Support Messages</span>
                  <span className="font-semibold text-green-900">456</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Success Rate</span>
                  <span className="font-semibold text-green-900">73%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}

export default CommunityPage
