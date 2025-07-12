import React, { useState, useEffect } from 'react'
import { useSupabaseContext } from '@/lib/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

export function RealTimeExample() {
  const {
    user,
    profile,
    dailyQuest,
    todayCheckIn,
    allyFeed,
    createAllyFeedPost,
    createCheckIn,
    completeQuest
  } = useSupabaseContext()

  const [newPost, setNewPost] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  // Example of real-time updates
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user.email)
      console.log('Profile loaded:', profile)
      console.log('Daily quest:', dailyQuest)
      console.log('Today\'s check-in:', todayCheckIn)
      console.log('Ally feed posts:', allyFeed.length)
    }
  }, [user, profile, dailyQuest, todayCheckIn, allyFeed])

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    
    setIsPosting(true)
    try {
      const { error } = await createAllyFeedPost(newPost)
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Post created successfully!"
        })
        setNewPost('')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      })
    } finally {
      setIsPosting(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      const { error } = await createCheckIn(5, 4, "Feeling great today!")
      if (error) {
        toast({
          title: "Error",
          description: "Failed to check in",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Check-in completed!"
        })
      }
    } catch (error) {
      console.error('Error checking in:', error)
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive"
      })
    }
  }

  const handleCompleteQuest = async () => {
    if (!dailyQuest) return
    
    try {
      const { error } = await completeQuest(dailyQuest.id, 5, 4, "This quest was amazing!")
      if (error) {
        toast({
          title: "Error",
          description: "Failed to complete quest",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Quest completed!"
        })
      }
    } catch (error) {
      console.error('Error completing quest:', error)
      toast({
        title: "Error",
        description: "Failed to complete quest",
        variant: "destructive"
      })
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-time Example</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to see real-time functionality.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Supabase Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Info</h3>
            <p>Email: {user.email}</p>
            <p>Username: {profile?.username || 'Not set'}</p>
            <p>Token Balance: {profile?.token_balance || 0}</p>
            <p>Current Streak: {profile?.current_streak || 0}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Daily Quest</h3>
            {dailyQuest ? (
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">{dailyQuest.title}</h4>
                <p className="text-sm text-muted-foreground">{dailyQuest.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{dailyQuest.difficulty}</Badge>
                  <Badge variant="secondary">{dailyQuest.token_reward} tokens</Badge>
                </div>
                <Button 
                  onClick={handleCompleteQuest}
                  className="mt-2"
                  size="sm"
                >
                  Complete Quest
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No daily quest available</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Check-in</h3>
            {todayCheckIn ? (
              <div className="p-3 border rounded-lg">
                <p>Mood: {todayCheckIn.mood_rating}/10</p>
                <p>Energy: {todayCheckIn.energy_level}/10</p>
                {todayCheckIn.notes && <p>Notes: {todayCheckIn.notes}</p>}
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-2">No check-in today</p>
                <Button onClick={handleCheckIn} size="sm">
                  Check In
                </Button>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Ally Feed ({allyFeed.length} posts)</h3>
            <div className="space-y-2">
              {allyFeed.slice(0, 3).map((post) => (
                <div key={post.id} className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">{post.profiles?.username || 'Anonymous'}</p>
                  <p className="text-sm">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with your allies..."
                className="w-full p-2 border rounded-lg resize-none"
                rows={3}
              />
              <Button 
                onClick={handleCreatePost}
                disabled={isPosting || !newPost.trim()}
                className="mt-2"
                size="sm"
              >
                {isPosting ? 'Posting...' : 'Post to Ally Feed'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 