import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Trophy, Flame, Users, TrendingUp, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import PostCreator from '@/components/feed/PostCreator'
import { useFeed, usePlaceBet } from '@/hooks/useFeed'
import { useState } from 'react'

const CommunityFeed = () => {
  const { data: posts = [], isLoading, refetch } = useFeed()
  const placeBet = usePlaceBet()
  const [activeTab, setActiveTab] = React.useState('all')
  const [localPosts, setLocalPosts] = React.useState([])

  const handlePostCreate = (post: any) => {
    setLocalPosts([post, ...localPosts])
    refetch()
  }

  const filteredItems = activeTab === 'all'
    ? [...localPosts, ...posts]
    : [...localPosts, ...posts].filter(item => item.type === activeTab)

  return (
    <div className="space-y-6">
      {/* Post Creator */}
      <PostCreator onPostCreate={handlePostCreate} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community Feed
          </CardTitle>
          <CardDescription>
            Celebrate victories and support each other on the journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="milestone">
                <Star className="h-3 w-3 mr-1" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="achievement">
                <Trophy className="h-3 w-3 mr-1" />
                Wins
              </TabsTrigger>
              <TabsTrigger value="support">
                <Heart className="h-3 w-3 mr-1" />
                Support
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4 mt-4">
              <div className="space-y-4">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {item.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{item.username || 'User'}</span>
                            {/* Add badge/type logic if available */}
                          </div>
                          <p className="text-sm text-foreground mb-3">
                            {item.content}
                          </p>
                          {item.media_url && (
                            <div className="mb-3">
                              <img
                                src={item.media_url}
                                alt="Post image"
                                className="max-w-full h-auto rounded-md"
                              />
                            </div>
                          )}
                          {/* Betting UI */}
                          <div className="flex items-center gap-4 mt-2">
                            <span>{item.total_staked} 💎</span>
                            <Button
                              size="sm"
                              onClick={() => placeBet.mutate({ post_id: item.id, amount: 10 })}
                              disabled={item.user_has_bet}
                            >
                              {item.user_has_bet ? 'Bet Placed' : 'Place 10 💎 Bet'}
                            </Button>
                          </div>
                          <CommentList comments={item.comments} />
                          <CommentForm postId={item.id} onComment={c => {
                            // Optimistically add comment to localPosts
                            setLocalPosts(posts => posts.map(p => p.id === item.id ? { ...p, comments: [c, ...(p.comments || [])] } : p))
                            refetch()
                          }} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">No posts yet. Be the first to share!</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function CommentList({ comments = [] }) {
  return (
    <div className="mt-2 space-y-2">
      {comments.map(comment => (
        <div key={comment.id} className="flex items-start gap-2 text-sm bg-muted/30 rounded p-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {comment.user_id?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-xs text-primary mb-0.5">{comment.user_id?.slice(0, 6) || 'User'}</div>
            <div>{comment.content}</div>
            <div className="text-muted-foreground text-xs mt-0.5">{new Date(comment.created_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommentForm({ postId, onComment }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/functions/post-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content: text }),
      })
      const comment = await res.json()
      onComment(comment)
      setText('')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        className="flex-1 rounded border px-2 py-1 text-sm"
        placeholder="Reply..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
        maxLength={300}
      />
      <Button type="submit" size="sm" disabled={loading || !text.trim()}>Send</Button>
    </form>
  )
}

export default CommunityFeed
