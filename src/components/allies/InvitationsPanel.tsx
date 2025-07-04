
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, Clock, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAllies } from '@/lib/hooks/useAllies'

const InvitationsPanel: React.FC = () => {
  const { pendingInvites, respondToInvite, isResponding } = useAllies()

  const handleAccept = (inviteId: string) => {
    respondToInvite({ inviteId, accept: true })
  }

  const handleDecline = (inviteId: string) => {
    respondToInvite({ inviteId, accept: false })
  }

  if (pendingInvites.length === 0) {
    return (
      <div className="text-center py-8">
        <Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-muted-foreground mb-2">No pending invitations</h3>
        <p className="text-sm text-muted-foreground">
          Battle ally invitations will appear here when received.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Pending Invitations</h3>
        <Badge variant="secondary">{pendingInvites.length}</Badge>
      </div>
      
      {pendingInvites.map((invite, index) => (
        <motion.div
          key={invite.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {invite.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold text-amber-900">{invite.username}</h4>
                    <p className="text-sm text-amber-700">
                      Current streak: {invite.current_streak} days
                    </p>
                    <p className="text-xs text-amber-600">
                      Wants to be your Battle Ally
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(invite.id)}
                    disabled={isResponding}
                    className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invite.id)}
                    disabled={isResponding}
                    className="gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3 w-3" />
                    Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default InvitationsPanel
