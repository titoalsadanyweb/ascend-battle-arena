import React from 'react'
import { useFeed, usePlaceBet } from '@/hooks/useFeed'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Heart, MessageCircle, Coins, Trophy, Flame, PlusCircle, Calendar } from 'lucide-react'

const CommunityFeed: React.FC = () => {
  const { data: posts, isLoading, error } = useFeed()
  const placeBetMutation = usePlaceBet()

  const handlePlaceBet = (postId: string, amount: number) => {
    placeBetMutation.mutate({ post_id: postId, amount })
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-amber-600" />
      case 'milestone': return <Flame className="h-4 w-4 text-orange-600" />
      case 'support': return <Heart className="h-4 w-4 text-pink-600" />
      default: return <PlusCircle className="h-4 w-4 text-blue-600" />
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading community feed...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load community feed. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!posts?.length) {
    return <div className="text-center py-8 text-muted-foreground">No posts yet. Be the first to share!</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <Card key={post.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{post.username || 'Anonymous'}</p>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getPostTypeIcon(post.type)}
                    {post.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {post.content && (
              <p className="text-sm leading-relaxed">{post.content}</p>
            )}
            
            {post.media_url && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={post.media_url} 
                  alt="Post attachment" 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments?.length || 0}
                </Button>
              </div>
              
              {post.total_staked > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Coins className="h-3 w-3" />
                    {post.total_staked} tokens staked
                  </Badge>
                  {!post.user_has_bet && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlaceBet(post.id, 10)}
                      disabled={placeBetMutation.isPending}
                    >
                      Bet 10 tokens
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default CommunityFeed
