
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, Shield, Plus, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface Ally {
  id: string
  username: string
  status: 'active' | 'offline' | 'away'
  lastSeen: string
  currentStreak: number
}

interface AlliesListProps {
  onSelectAlly: (allyId: string) => void
}

const AlliesList: React.FC<AlliesListProps> = ({ onSelectAlly }) => {
  // Mock data for now - in real implementation, this would come from useAllyList hook
  const allies: Ally[] = [
    {
      id: 'ally-1',
      username: 'BattleWarrior_001',
      status: 'active',
      lastSeen: 'Online now',
      currentStreak: 15
    },
    {
      id: 'ally-2', 
      username: 'SteelResolve_42',
      status: 'away',
      lastSeen: '2 hours ago',
      currentStreak: 8
    },
    {
      id: 'ally-3',
      username: 'VictorySeeker',
      status: 'offline',
      lastSeen: '1 day ago',
      currentStreak: 22
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Online'
      case 'away':
        return 'Away'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  if (allies.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm mb-4">
          No battle allies yet. Start building your support network!
        </p>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Find Battle Allies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {allies.map((ally, index) => (
        <motion.div
          key={ally.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(ally.status)} rounded-full border-2 border-background`}></div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm">{ally.username}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ally.lastSeen}</span>
                      <Badge variant="secondary" className="text-xs">
                        {ally.currentStreak} day streak
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant={ally.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {getStatusText(ally.status)}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSelectAlly(ally.username)}
                    className="gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <div className="pt-4 border-t border-border/50">
        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add New Battle Ally
        </Button>
      </div>
    </div>
  )
}

export default AlliesList
