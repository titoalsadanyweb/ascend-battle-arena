
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageCircle, Trophy, Coins, Heart, Handshake, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllies } from '@/lib/hooks/useAllies'
import { useAllyFeed } from '@/lib/hooks/useAllyFeed'
import { useCommitments } from '@/lib/hooks/useCommitments'

const EnhancedAllyPanel = () => {
  const { allies, isLoading: alliesLoading } = useAllies()
  const { feedEvents, isLoading: feedLoading } = useAllyFeed()
  const { activeCommitments } = useCommitments()
  const [activeTab, setActiveTab] = useState('feed')

  const ally = allies.length > 0 ? allies[0] : null
  const allyProfile = ally?.ally_profile

  // Check if there's an active shared commitment
  const sharedCommitment = activeCommitments.find(c => c.ally_id && c.matched_stake_amount > 0)

  if (alliesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ally) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Battle Ally</h3>
          <p className="text-muted-foreground text-center mb-6">
            Connect with a battle ally for mutual accountability and support
          </p>
          <Button className="gap-2">
            <Users className="h-4 w-4" />
            Find Battle Ally
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {allyProfile?.username?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{allyProfile?.username}</h3>
                <p className="text-sm text-muted-foreground">Battle Ally</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {sharedCommitment && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                  <Handshake className="h-3 w-3 mr-1" />
                  Shared Battle
                </Badge>
              )}
              <Badge variant="outline" className="text-green-600 border-green-300">
                <Flame className="h-3 w-3 mr-1" />
                {allyProfile?.current_streak || 0} day streak
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Mutual accountability and support in your journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <Trophy className="h-4 w-4" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-2">
                <Heart className="h-4 w-4" />
                Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4 mt-4">
              <div className="space-y-3">
                {feedLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (feedEvents || []).length > 0 ? (
                  (feedEvents || []).slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {item.actor_username?.charAt(0)?.toUpperCase() || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {item.actor_username}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.details}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {item.event_type === 'checkin' && (
                          <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        {item.event_type === 'quest_complete' && (
                          <MessageCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent activity to display
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Current Streak</span>
                  </div>
                  <p className="text-lg font-bold text-green-900 mt-1">
                    {allyProfile?.current_streak || 0} days
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Best Streak</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 mt-1">
                    {allyProfile?.current_streak || 0} days
                  </p>
                </div>
              </div>

              {sharedCommitment && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Handshake className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Shared Battle Contract</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    {sharedCommitment.duration_days}-day commitment with {sharedCommitment.matched_stake_amount} SIT ally stake
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 bg-amber-200 rounded-full flex-1">
                      <div 
                        className="h-2 bg-amber-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, ((Date.now() - new Date(sharedCommitment.start_date).getTime()) / (new Date(sharedCommitment.end_date).getTime() - new Date(sharedCommitment.start_date).getTime())) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-amber-600">
                      {Math.max(0, Math.ceil((new Date(sharedCommitment.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="support" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full gap-2">
                  <Coins className="h-4 w-4" />
                  Send Encouragement Tokens
                </Button>
                
                <Button variant="outline" className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Send Quick Message
                </Button>
                
                <Button variant="outline" className="w-full gap-2">
                  <Handshake className="h-4 w-4" />
                  Propose Joint Challenge
                </Button>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                      <span className="text-sm">👊 "Stay strong!"</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                      <span className="text-sm">🔥 "Keep the streak alive!"</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                      <span className="text-sm">💪 "You've got this!"</span>
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default EnhancedAllyPanel
