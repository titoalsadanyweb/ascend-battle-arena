import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export function useFeed() {
  return useQuery(['feed'], async () => {
    const res = await fetch('/functions/feed-recent')
    if (!res.ok) {
      toast({ title: 'Failed to load feed', variant: 'destructive' })
      throw new Error('Failed to load feed')
    }
    return res.json()
  })
}

export function usePlaceBet() {
  return useMutation(
    async ({ post_id, amount }) => {
      const res = await fetch('/functions/bet-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id, amount }),
      })
      if (!res.ok) {
        toast({ title: 'Failed to place bet', variant: 'destructive' })
        throw new Error('Failed to place bet')
      }
      return res.json()
    }
  )
}

export function useCreatePost() {
  return useMutation(
    async ({ content, media_url }) => {
      const res = await fetch('/functions/post-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, media_url }),
      })
      if (!res.ok) {
        toast({ title: 'Failed to create post', variant: 'destructive' })
        throw new Error('Failed to create post')
      }
      return res.json()
    }
  )
} 