
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Shield, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import AllyFeed from '@/components/feed/AllyFeed'
import EnhancedAllyChat from '@/components/feed/EnhancedAllyChat'
import AlliesList from '@/components/feed/AlliesList'

const AllyFeedPage = () => {
  const [selectedAlly, setSelectedAlly] = useState<string | null>(null)
  const [showBattleCommunications, setShowBattleCommunications] = useState(false)

  return (
    <AppLayout>
      <div className="relative">
        {/* Gradient atmospheric effects */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6 relative z-10 p-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block mb-4 relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Users className="h-12 w-12 text-primary mx-auto" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
            </motion.div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ALLY NETWORK
            </h1>
            <p className="text-muted-foreground font-medium">Connect with your battle companions</p>
            
            {/* Battle Communications Icon */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowBattleCommunications(true)}
                className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30"
              >
                <MessageCircle className="h-4 w-4" />
                Battle Communications
              </Button>
            </motion.div>
          </motion.div>

          {!selectedAlly && !showBattleCommunications ? (
            // Main Allies View - Full Screen
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                    <Users className="h-8 w-8" />
                    My Battle Allies
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your trusted companions in the battle for self-mastery. Connect, chat, and support each other.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <AlliesList onSelectAlly={setSelectedAlly} />
                </CardContent>
              </Card>
            </motion.div>
          ) : selectedAlly ? (
            // Individual Ally Chat View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAlly(null)}
                >
                  ← Back to Allies
                </Button>
                <h2 className="text-xl font-bold text-primary">
                  Chat with {selectedAlly}
                </h2>
              </div>
              
              <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm h-[600px]">
                <CardContent className="h-full p-0">
                  <EnhancedAllyChat selectedAllyId={selectedAlly} />
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Battle Communications View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBattleCommunications(false)}
                >
                  ← Back to Allies
                </Button>
                <h2 className="text-xl font-bold text-primary">
                  Battle Communications Center
                </h2>
              </div>
              
              <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <MessageCircle className="h-6 w-6" />
                    Network Activity Feed
                  </CardTitle>
                  <CardDescription>
                    Recent victories and achievements from your allies network.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AllyFeed />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default AllyFeedPage
