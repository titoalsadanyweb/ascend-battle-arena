
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageCircle, Coins, Handshake, Flame, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllies } from '@/lib/hooks/useAllies'
import { useAllyFeed } from '@/lib/hooks/useAllyFeed'
import { useCommitments } from '@/lib/hooks/useCommitments'
import { Link } from 'react-router-dom'
import AllyInteractionModal from '@/components/social/AllyInteractionModal'

const AllySection = () => {
  const { allies, isLoading: alliesLoading } = useAllies()
  const { feedEvents } = useAllyFeed()
  const { activeCommitments } = useCommitments()
  const [interactionModal, setInteractionModal] = useState<{
    open: boolean
    type: 'tokens' | 'message' | 'challenge' | null
  }>({ open: false, type: null })

  const ally = allies.length > 0 ? allies[0] : null
  const allyProfile = ally?.ally_profile
  const recentFeedItems = (feedEvents || []).slice(0, 2)
  const sharedCommitment = activeCommitments.find(c => c.ally_id && c.matched_stake_amount > 0)

  const handleInteraction = (type: 'tokens' | 'message' | 'challenge') => {
    setInteractionModal({ open: true, type })
  }

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
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-2">No Battle Ally Connected</h3>
          <p className="text-muted-foreground text-center text-sm mb-4">
            Partner with an ally for accountability and support
          </p>
          <Link to="/community">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Find Battle Ally
            </Button>
          </Link>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {allyProfile?.username?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span>{allyProfile?.username}</span>
                  <Badge variant="outline" className="ml-2">Battle Ally</Badge>
                </div>
              </CardTitle>
              <CardDescription className="mt-1">
                Mutual accountability partner
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {sharedCommitment && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                  <Handshake className="h-3 w-3 mr-1" />
                  Shared Battle
                </Badge>
              )}
              <Badge variant="outline" className="text-green-600 border-green-300">
                <Flame className="h-3 w-3 mr-1" />
                {allyProfile?.current_streak || 0} days
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Recent Activity */}
            {recentFeedItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {recentFeedItems.map((item) => (
                    <div key={item.id} className="p-2 bg-muted/50 rounded text-sm">
                      <p className="text-muted-foreground">{item.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Commitment Progress */}
            {sharedCommitment && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Shared {sharedCommitment.duration_days}-Day Contract
                  </span>
                </div>
                <div className="flex items-center gap-2">
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

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleInteraction('tokens')}
              >
                <Coins className="h-3 w-3" />
                Send
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleInteraction('message')}
              >
                <MessageCircle className="h-3 w-3" />
                Message
              </Button>
              <Link to="/community">
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-3 w-3" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <AllyInteractionModal
        open={interactionModal.open}
        onOpenChange={(open) => setInteractionModal({ open, type: null })}
        allyUsername={allyProfile?.username || ''}
        interactionType={interactionModal.type}
      />
    </motion.div>
  )
}

export default AllySection
