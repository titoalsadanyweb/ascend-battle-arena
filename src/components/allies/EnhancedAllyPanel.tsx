
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, MessageCircle, UserPlus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PotentialAlliesList from './PotentialAlliesList'
import InvitationsPanel from './InvitationsPanel'
import { useAllies } from '@/lib/hooks/useAllies'

const EnhancedAllyPanel: React.FC = () => {
  const [searchUsername, setSearchUsername] = useState('')
  const [activeTab, setActiveTab] = useState('discover')
  const { allies, inviteAlly, isInviting } = useAllies()

  const handleDirectInvite = () => {
    if (!searchUsername.trim()) return
    inviteAlly(searchUsername.trim())
    setSearchUsername('')
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
          BATTLE ALLY COMMAND CENTER
        </h2>
        <p className="text-muted-foreground font-medium">Find your perfect accountability partner</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="direct" className="gap-2">
            <Search className="h-4 w-4" />
            Direct Invite
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                Recommended Battle Allies
              </CardTitle>
              <CardDescription>
                AI-matched allies based on language, beliefs, and compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PotentialAlliesList onInviteSent={() => setActiveTab('invitations')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageCircle className="h-5 w-5" />
                Battle Invitations
              </CardTitle>
              <CardDescription>
                Manage your sent and received battle ally invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct" className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <UserPlus className="h-5 w-5" />
                Direct Battle Ally Invite
              </CardTitle>
              <CardDescription>
                Know someone specific? Invite them directly by username
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter warrior username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDirectInvite()}
                />
                <Button 
                  onClick={handleDirectInvite}
                  disabled={!searchUsername.trim() || isInviting}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {isInviting ? 'Sending...' : 'Invite'}
                </Button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Tips for Finding Battle Allies:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use the "Discover" tab for AI-matched recommendations</li>
                  <li>• Look for warriors with similar streaks and goals</li>
                  <li>• Consider language and timezone compatibility</li>
                  <li>• Shared beliefs and interests strengthen bonds</li>
                </ul>
              </div>

              {allies.length > 0 && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-medium text-primary mb-2">Current Battle Allies: {allies.length}</h4>
                  <p className="text-sm text-muted-foreground">
                    You can have multiple battle allies to build a strong support network.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedAllyPanel
