import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string | null
  image_url: string | null
  created_at: string
  sender_username?: string
}

interface UseRealtimeChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  sendMessage: (content: { message?: string; image?: File }) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  typingUsers: string[]
  startTyping: () => void
  stopTyping: () => void
}

export const useRealtimeChat = (allyId: string | null): UseRealtimeChatReturn => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!user?.id || !allyId) {
      setIsLoading(false)
      return
    }

    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          message,
          image_url,
          created_at
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${allyId}),and(sender_id.eq.${allyId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Get usernames for messages
      const userIds = Array.from(new Set([...messagesData.map(m => m.sender_id), allyId, user.id]))
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)

      const profileMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile.username
        return acc
      }, {} as Record<string, string>) || {}

      const messagesWithUsernames = messagesData.map(msg => ({
        ...msg,
        sender_username: profileMap[msg.sender_id] || 'Unknown'
      }))

      setMessages(messagesWithUsernames)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Failed to load messages",
        description: "Please try refreshing the page.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, allyId, toast])

  // Send message
  const sendMessage = useCallback(async (content: { message?: string; image?: File }) => {
    if (!user?.id || !allyId || isSending) return
    if (!content.message?.trim() && !content.image) return

    setIsSending(true)

    try {
      let imageUrl = null

      // Upload image if provided
      if (content.image) {
        const fileExt = content.image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, content.image)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(uploadData.path)
        
        imageUrl = data.publicUrl
      }

      // Insert message
      const { data: messageData, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: allyId,
          message: content.message?.trim() || null,
          image_url: imageUrl
        })
        .select('*')
        .single()

      if (error) throw error

      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }, [user?.id, allyId, isSending, toast])

  // Mark message as read (placeholder for future implementation)
  const markAsRead = useCallback(async (messageId: string) => {
    // TODO: Implement read status tracking
    console.log('Mark as read:', messageId)
  }, [])

  // Typing indicators (placeholder for future implementation)
  const startTyping = useCallback(() => {
    // TODO: Implement typing indicators using Supabase Realtime presence
    console.log('Start typing')
  }, [])

  const stopTyping = useCallback(() => {
    // TODO: Implement typing indicators using Supabase Realtime presence
    console.log('Stop typing')
  }, [])

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id || !allyId) return

    loadMessages()

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${allyId}),and(sender_id.eq.${allyId},receiver_id.eq.${user.id}))`
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage

          // Get sender username
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithUsername = {
            ...newMessage,
            sender_username: profile?.username || 'Unknown'
          }

          setMessages(prev => {
            const exists = prev.find(msg => msg.id === newMessage.id)
            if (exists) return prev
            return [...prev, messageWithUsername]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, allyId, loadMessages])

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    markAsRead,
    typingUsers,
    startTyping,
    stopTyping
  }
}