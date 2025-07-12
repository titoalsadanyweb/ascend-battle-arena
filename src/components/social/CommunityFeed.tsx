import React from 'react'
import { useAllyFeed } from '@/lib/hooks/useAllyFeed'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const CommunityFeed: React.FC = () => {
  const { feedEvents, isLoading, error } = useAllyFeed()

  if (isLoading) {
    return <div className="text-center py-8">Loading community feed...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'Failed to load community feed. Please try again.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!feedEvents.length) {
    return <div className="text-center py-8 text-muted-foreground">No community activity yet.</div>
  }

  return (
    <div className="space-y-4">
      {feedEvents.map(event => (
        <div key={event.id} className="p-4 border rounded-lg bg-card">
          <div className="font-semibold">{event.actor_username || 'Anonymous'}</div>
          <div>{event.details}</div>
          <div className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

export default CommunityFeed
