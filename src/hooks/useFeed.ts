import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/feed-recent`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        toast({ title: 'Failed to load feed', variant: 'destructive' })
        throw new Error('Failed to load feed')
      }
      return response.json()
    },
  })
}

export function usePlaceBet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ post_id, amount }: { post_id: string; amount: number }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/bet-create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post_id, amount }),
        }
      )

      if (!response.ok) {
        toast({ title: 'Failed to place bet', variant: 'destructive' })
        throw new Error('Failed to place bet')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast({ title: 'Bet placed successfully!' })
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ content, media_url }: { content: string; media_url?: string }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/post-create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, media_url }),
        }
      )

      if (!response.ok) {
        toast({ title: 'Failed to create post', variant: 'destructive' })
        throw new Error('Failed to create post')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast({ title: 'Post created successfully!' })
    },
  })
}