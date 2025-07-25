
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Send, Shield, Clock, Image as ImageIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/lib/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import ChatImageUpload from './ChatImageUpload'

interface ChatMessage {
  id: string
  sender_id: string
  sender_username: string
  message: string
  image?: string
  created_at: string
}

interface EnhancedAllyChatProps {
  selectedAllyId?: string
}

const EnhancedAllyChat: React.FC<EnhancedAllyChatProps> = ({ selectedAllyId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load messages for the selected ally
    const timer = setTimeout(() => {
      if (selectedAllyId) {
        setMessages([
          {
            id: '1',
            sender_id: 'ally-1',
            sender_username: selectedAllyId,
            message: 'Great work on your 5-day streak! Keep pushing forward! 💪',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            sender_id: user?.id || 'current-user',
            sender_username: 'You',
            message: 'Thanks! Your support means everything. How was your quest today?',
            created_at: new Date(Date.now() - 1800000).toISOString()
          }
        ])
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedAllyId, user?.id])

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || isSending) return

    setIsSending(true)
    try {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender_id: user?.id || 'current-user',
        sender_username: 'You',
        message: newMessage.trim(),
        image: selectedImage?.preview,
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
      setSelectedImage(null)
      
      toast({
        title: "Message Sent",
        description: `Your message has been delivered to ${selectedAllyId}.`,
      })
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4 p-4 overflow-y-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{selectedAllyId || 'Battle Ally'}</p>
            <p className="text-xs text-muted-foreground">Online now</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No messages yet. Start a conversation with your battle ally!
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.sender_username}
                    </span>
                    {message.sender_id !== user?.id && (
                      <Badge variant="secondary" className="text-xs">
                        Ally
                      </Badge>
                    )}
                  </div>
                  {message.image && (
                    <div className="mb-2">
                      <img
                        src={message.image}
                        alt="Shared"
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                  {message.message && (
                    <p className="text-sm mb-1">{message.message}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs opacity-60">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        {selectedImage && (
          <div className="mb-3">
            <div className="relative inline-block">
              <img
                src={selectedImage.preview}
                alt="Selected"
                className="w-20 h-20 object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="flex items-end gap-2">
            <ChatImageUpload
              onImageSelect={(file, preview) => setSelectedImage({ file, preview })}
              onRemove={() => setSelectedImage(null)}
              selectedImage={null}
            />
          </div>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Send encouragement to ${selectedAllyId || 'your battle ally'}...`}
            className="flex-1"
            disabled={isSending}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • Share images and encouragement
        </p>
      </div>
    </div>
  )
}

export default EnhancedAllyChat
