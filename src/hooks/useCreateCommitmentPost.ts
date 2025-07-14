import { useMutation } from '@tanstack/react-query'

interface CreateCommitmentPostParams {
  content: string
  stake: number
  duration_days: number
  is_public: boolean
}

export function useCreateCommitmentPost() {
  return useMutation({
    mutationFn: async ({ content, stake, duration_days, is_public }: CreateCommitmentPostParams) => {
      const { supabase } = await import('@/integrations/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/post-create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content, type: 'commitment', stake, duration_days, is_public }),
      })

      if (!response.ok) {
        throw new Error('Failed to create commitment post')
      }
      
      return response.json()
    }
  })
}