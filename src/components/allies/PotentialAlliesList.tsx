
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MapPin, Languages, Heart, Star, Shield, Clock, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllyMatching } from '@/lib/hooks/useAllyMatching'

interface PotentialAlly {
  user_id: string
  username: string
  language: string
  secondary_language?: string
  religion?: string
  bio?: string
  current_streak: number
  best_streak: number
  timezone: string
  match_score: number
  country?: string | null
  interests?: string[]
  age_group?: string
  trust_score?: number
  compatibility_reasons?: string[]
}

interface PotentialAlliesListProps {
  onInviteSent: () => void
}

const PotentialAlliesList: React.FC<PotentialAlliesListProps> = ({ onInviteSent }) => {
  const { potentialAllies, sendInvitation, isSending, isLoading } = useAllyMatching()

  const handleInvite = (targetUserId: string) => {
    sendInvitation({ targetUserId })
    onInviteSent()
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {potentialAllies.map((ally, index) => (
        <motion.div
          key={ally.user_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {ally.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{ally.username}</h3>
                      <Badge className={`text-xs ${getMatchScoreColor(ally.match_score)}`}>
                        <Star className="h-3 w-3 mr-1" />
                        {ally.match_score}% match
                      </Badge>
                      {ally.trust_score && ally.trust_score >= 90 && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Languages className="h-3 w-3" />
                        {ally.language}
                        {ally.secondary_language && `, ${ally.secondary_language}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ally.timezone.split('/')[1]?.replace('_', ' ') || ally.timezone}
                      </div>
                    </div>

                    {ally.religion && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Heart className="h-3 w-3" />
                        {ally.religion}
                      </div>
                    )}

                    {ally.bio && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ally.bio}
                      </p>
                    )}

                    {ally.compatibility_reasons && ally.compatibility_reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ally.compatibility_reasons.slice(0, 3).map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {ally.interests && ally.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ally.interests.slice(0, 4).map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-medium text-green-600">{ally.current_streak} days</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Best: </span>
                        <span className="font-medium text-blue-600">{ally.best_streak} days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button 
                    onClick={() => handleInvite(ally.user_id)}
                    disabled={isSending}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {isSending ? 'Inviting...' : 'Start Trial'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    7-day trial period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {potentialAllies.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-muted-foreground mb-2">No matches found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your preferences or check back later for new warriors.
          </p>
        </div>
      )}
    </div>
  )
}

export default PotentialAlliesList
