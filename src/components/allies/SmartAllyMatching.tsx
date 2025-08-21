import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Users, MapPin, Languages, Heart, Star, Shield, Target, 
  Clock, MessageSquare, Sparkles, TrendingUp, Calendar
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllyMatching, PotentialAlly } from '@/lib/hooks/useAllyMatching'

interface SmartAllyMatchingProps {
  onInviteSent: () => void
}

const SmartAllyMatching: React.FC<SmartAllyMatchingProps> = ({ onInviteSent }) => {
  const { potentialAllies, sendInvitation, isSending, isLoading } = useAllyMatching()
  const [selectedAlly, setSelectedAlly] = useState<PotentialAlly | null>(null)

  const topMatches = potentialAllies.slice(0, 5)

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const handleStartPartnership = (ally: PotentialAlly) => {
    sendInvitation({ targetUserId: ally.user_id })
    onInviteSent()
  }

  const AllyCard: React.FC<{ ally: PotentialAlly; isSelected?: boolean }> = ({ 
    ally, 
    isSelected = false 
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-primary/20 hover:border-primary/40 hover:shadow-md'
        }`}
        onClick={() => setSelectedAlly(isSelected ? null : ally)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {ally.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{ally.username}</h3>
                <Badge className={`text-xs border ${getMatchScoreColor(ally.match_score)}`}>
                  <Star className="h-3 w-3 mr-1" />
                  {ally.match_score}%
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Languages className="h-3 w-3" />
                <span>{ally.language}</span>
                {ally.religion && (
                  <>
                    <span>•</span>
                    <Heart className="h-3 w-3" />
                    <span>{ally.religion}</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-green-600">{ally.current_streak}d</span>
                </div>
                {ally.trust_score && ally.trust_score >= 90 && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Trusted
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const AllyDetailsPanel: React.FC<{ ally: PotentialAlly }> = ({ ally }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {ally.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {ally.username}
            </CardTitle>
            <Badge className={`border ${getMatchScoreColor(ally.match_score)}`}>
              <Star className="h-3 w-3 mr-1" />
              {ally.match_score}% Compatibility
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Compatibility Breakdown */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Compatibility Analysis
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overall Match</span>
                <div className="flex items-center gap-2">
                  <Progress value={ally.match_score} className="w-16 h-2" />
                  <span className="text-sm font-medium">{ally.match_score}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-700">{ally.current_streak}</div>
              <div className="text-xs text-green-600">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-blue-700">{ally.best_streak}</div>
              <div className="text-xs text-blue-600">Best Streak</div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span>{ally.language}</span>
              {ally.secondary_language && <span>• {ally.secondary_language}</span>}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{ally.timezone.split('/')[1]?.replace('_', ' ') || ally.timezone}</span>
            </div>

            {ally.religion && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>{ally.religion}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {ally.bio && (
            <div>
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{ally.bio}</p>
            </div>
          )}

          {/* Compatibility Reasons */}
          {ally.compatibility_reasons && ally.compatibility_reasons.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Why You Match</h4>
              <div className="flex flex-wrap gap-1">
                {ally.compatibility_reasons.map((reason, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {ally.interests && ally.interests.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Shared Interests</h4>
              <div className="flex flex-wrap gap-1">
                {ally.interests.map((interest, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={() => handleStartPartnership(ally)}
            disabled={isSending}
            className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            size="lg"
          >
            <Users className="h-4 w-4" />
            {isSending ? 'Starting Partnership...' : 'Start Battle Partnership'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Begin your accountability journey together
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (topMatches.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-muted-foreground mb-2">No matches found</h3>
          <p className="text-sm text-muted-foreground">
            Check back later for potential battle allies.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Ally List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Top Matches for You</h3>
        </div>
        
        <div className="space-y-3">
          {topMatches.map((ally, index) => (
            <motion.div
              key={ally.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <AllyCard 
                ally={ally} 
                isSelected={selectedAlly?.user_id === ally.user_id}
              />
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            <Sparkles className="h-4 w-4 inline mr-1" />
            Click on any ally to see detailed compatibility analysis
          </p>
        </div>
      </div>

      {/* Right Panel - Selected Ally Details */}
      <div className="lg:sticky lg:top-4">
        {selectedAlly ? (
          <AllyDetailsPanel ally={selectedAlly} />
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/25 h-96">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">Select a Battle Ally</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any potential ally to see detailed compatibility analysis
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SmartAllyMatching