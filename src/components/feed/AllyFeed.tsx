
import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAllyFeed } from '@/lib/hooks/useAllyFeed'
import { formatDistanceToNow } from 'date-fns'
import { Users, Trophy, CheckCircle, Target } from 'lucide-react'

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'checkin':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'quest_complete':
      return <Target className="h-4 w-4 text-blue-500" />
    case 'milestone':
      return <Trophy className="h-4 w-4 text-amber-500" />
    default:
      return <Users className="h-4 w-4 text-gray-500" />
  }
}

const getEventBadgeColor = (eventType: string) => {
  switch (eventType) {
    case 'checkin':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'quest_complete':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'milestone':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

const AllyFeed: React.FC = () => {
  const { feedEvents, isLoading, error } = useAllyFeed()

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Failed to load battle communications. Please try again.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (feedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Battle Communications</h3>
        <p className="text-muted-foreground text-sm">
          When your allies achieve victories or complete quests, their updates will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {feedEvents.map((event) => (
        <div key={event.id} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex-shrink-0 mt-0.5">
            {getEventIcon(event.event_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">
                {event.actor_username}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getEventBadgeColor(event.event_type)}`}
              >
                {event.event_type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {event.details}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AllyFeed
