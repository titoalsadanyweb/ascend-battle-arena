import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Image as ImageIcon, Trophy, Flame, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import ChatImageUpload from './ChatImageUpload'
import { useAuth } from '@/lib/AuthProvider'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface PostCreatorProps {
  onPostCreate?: (post: any) => void
}

async function uploadImageToSupabase(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  // You may need to adjust the endpoint and headers for your Supabase Storage setup
  const res = await fetch('/storage/v1/object/post-images', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) return null
  const { Key } = await res.json()
  return Key ? `/storage/v1/object/${Key}` : null
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreate }) => {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [postText, setPostText] = useState('')
  const [postType, setPostType] = useState<string>('update')
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const postTypes = [
    { value: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-amber-600' },
    { value: 'milestone', label: 'Milestone', icon: Flame, color: 'text-orange-600' },
    { value: 'support', label: 'Support Request', icon: Heart, color: 'text-pink-600' },
    { value: 'update', label: 'General Update', icon: PlusCircle, color: 'text-blue-600' },
  ]

  const selectedPostType = postTypes.find(type => type.value === postType)

  const handleSubmit = async () => {
    if (!postText.trim() && !selectedImage) return
    setIsPosting(true)
    try {
      let media_url = ''
      if (selectedImage?.file) {
        media_url = await uploadImageToSupabase(selectedImage.file) || ''
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch('https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/post-create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content: postText, media_url, type: postType }),
      })
      const newPost = await res.json()
      onPostCreate?.(newPost)
      toast({
        title: 'Post Shared! 🎉',
        description: 'Your update has been shared with the community.',
      })
      setPostText('')
      setSelectedImage(null)
      setPostType('update')
      setIsExpanded(false)
    } catch (error) {
      toast({
        title: 'Post Failed',
        description: 'Failed to share your post. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsPosting(false)
    }
  }

  if (!isExpanded) {
    return (
      <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div 
            className="flex items-center gap-3"
            onClick={() => setIsExpanded(true)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-muted-foreground">
              Share your progress, achievements, or ask for support...
            </div>
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusCircle className="h-5 w-5 text-primary" />
            Share with Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.email?.split('@')[0] || 'User'}</p>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={`Share your ${selectedPostType?.label.toLowerCase()}...`}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChatImageUpload
                onImageSelect={(file, preview) => setSelectedImage({ file, preview })}
                onRemove={() => setSelectedImage(null)}
                selectedImage={selectedImage}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {postText.length}/500
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsExpanded(false)
                setPostText('')
                setSelectedImage(null)
                setPostType('update')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={(!postText.trim() && !selectedImage) || isPosting}
              className="gap-2"
            >
              {selectedPostType && <selectedPostType.icon className="h-4 w-4" />}
              {isPosting ? 'Sharing...' : 'Share Post'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PostCreator
