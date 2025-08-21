import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, MapPin, Languages, Heart, Star, Shield, Target, 
  Filter, Search, Clock, MessageSquare, Sparkles 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllyMatching, PotentialAlly } from '@/lib/hooks/useAllyMatching'
import { useAllyTrials } from '@/lib/hooks/useAllyTrials'
import AllyTrialCard from './AllyTrialCard'

const EnhancedAllyDiscovery: React.FC = () => {
  const { potentialAllies, sendInvitation, isSending, isLoading } = useAllyMatching()
  const { trials, startTrial, isStarting } = useAllyTrials()
  const [searchTerm, setSearchTerm] = useState('')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [religionFilter, setReligionFilter] = useState('all')
  const [minMatchScore, setMinMatchScore] = useState(70)

  const filteredAllies = potentialAllies.filter(ally => {
    if (searchTerm && !ally.username.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (languageFilter !== 'all' && ally.language !== languageFilter) {
      return false
    }
    if (religionFilter !== 'all' && ally.religion !== religionFilter) {
      return false
    }
    if (ally.match_score < minMatchScore) {
      return false
    }
    return true
  })

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const handleStartTrial = (allyId: string) => {
    startTrial({ allyId })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          className="inline-block mb-4 relative"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <Users className="h-12 w-12 text-primary mx-auto" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
        </motion.div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          ALLY DISCOVERY CENTER
        </h2>
        <p className="text-muted-foreground font-medium">Find your perfect accountability partner</p>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Discover ({filteredAllies.length})
          </TabsTrigger>
          <TabsTrigger value="trials" className="gap-2">
            <Clock className="h-4 w-4" />
            Active Trials ({trials.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6 mt-6">
          {/* Filters */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Smart Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={religionFilter} onValueChange={setReligionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Beliefs</SelectItem>
                    <SelectItem value="Christian">Christian</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Jewish">Jewish</SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Buddhist">Buddhist</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={minMatchScore.toString()} onValueChange={(value) => setMinMatchScore(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min Match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%+ Match</SelectItem>
                    <SelectItem value="70">70%+ Match</SelectItem>
                    <SelectItem value="80">80%+ Match</SelectItem>
                    <SelectItem value="90">90%+ Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Potential Allies */}
          <div className="space-y-4">
            {isLoading ? (
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
            ) : filteredAllies.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">No matches found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later for new warriors.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAllies.map((ally, index) => (
                <motion.div
                  key={ally.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                              {ally.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg text-foreground">{ally.username}</h3>
                              <Badge className={`text-xs border ${getMatchScoreColor(ally.match_score)}`}>
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
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Languages className="h-4 w-4" />
                                {ally.language}
                                {ally.secondary_language && `, ${ally.secondary_language}`}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {ally.timezone.split('/')[1]?.replace('_', ' ') || ally.timezone}
                              </div>
                              {ally.religion && (
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {ally.religion}
                                </div>
                              )}
                            </div>

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
                              <div className="flex flex-wrap gap-1 mb-4">
                                {ally.interests.slice(0, 4).map((interest, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    <Target className="h-3 w-3 mr-1" />
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">Current: </span>
                                <span className="font-semibold text-green-600">{ally.current_streak} days</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Best: </span>
                                <span className="font-semibold text-blue-600">{ally.best_streak} days</span>
                              </div>
                              {ally.trust_score && (
                                <div>
                                  <span className="text-muted-foreground">Trust: </span>
                                  <span className="font-semibold text-purple-600">{ally.trust_score}/100</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 ml-4">
                          <Button 
                            onClick={() => handleStartTrial(ally.user_id)}
                            disabled={isStarting || isSending}
                            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          >
                            <Clock className="h-4 w-4" />
                            {isStarting ? 'Starting...' : 'Start 7-Day Trial'}
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            No commitment required
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trials" className="space-y-6 mt-6">
          {trials.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">No active trials</h3>
                <p className="text-sm text-muted-foreground">
                  Start a trial with a potential ally to begin building your partnership.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {trials.map((trial) => (
                <AllyTrialCard key={trial.id} trial={trial} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedAllyDiscovery