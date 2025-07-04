
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MapPin, Languages, Heart, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllies } from '@/lib/hooks/useAllies'

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
}

interface PotentialAlliesListProps {
  onInviteSent: () => void
}

const PotentialAlliesList: React.FC<PotentialAlliesListProps> = ({ onInviteSent }) => {
  const { inviteAlly, isInviting } = useAllies()
  
  // Mock data for potential allies (in real app, this would come from the API)
  const potentialAllies: PotentialAlly[] = [
    {
      user_id: '1',
      username: 'WarriorSeeker',
      language: 'English',
      secondary_language: 'Spanish',
      religion: 'Christian',
      bio: 'On a journey of self-improvement and faith.',
      current_streak: 12,
      best_streak: 25,
      timezone: 'America/New_York',
      match_score: 95
    },
    {
      user_id: '2',
      username: 'MindfulFighter',
      language: 'English',
      current_streak: 8,
      best_streak: 15,
      timezone: 'America/Los_Angeles',
      match_score: 88
    },
    {
      user_id: '3',
      username: 'SteadyProgress',
      language: 'English',
      religion: 'Muslim',
      bio: 'Consistency over perfection.',
      current_streak: 6,
      best_streak: 18,
      timezone: 'Europe/London',
      match_score: 82
    }
  ]

  const handleInvite = (username: string) => {
    inviteAlly(username)
    onInviteSent()
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    return 'text-yellow-600 bg-yellow-50'
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

                <Button 
                  onClick={() => handleInvite(ally.username)}
                  disabled={isInviting}
                  className="gap-2 shrink-0"
                >
                  <Users className="h-4 w-4" />
                  {isInviting ? 'Inviting...' : 'Invite'}
                </Button>
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
