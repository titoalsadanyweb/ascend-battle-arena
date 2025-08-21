
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, MessageCircle, UserPlus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import SmartAllyMatching from './SmartAllyMatching'
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Discovery Center
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                Smart Battle Ally Matching
              </CardTitle>
              <CardDescription>
                AI-powered compatibility analysis finds your perfect accountability partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartAllyMatching onInviteSent={() => setActiveTab('invitations')} />
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

      </Tabs>
    </div>
  )
}

export default EnhancedAllyPanel
