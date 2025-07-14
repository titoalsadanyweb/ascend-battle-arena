import { useMutation } from '@tanstack/react-query'

interface CreateCommitmentPostParams {
  content: string
  stake: number
  duration_days: number
  is_public: boolean
}

export function useCreateCommitmentPost() {
  return useMutation({
    mutationFn: ({ content, stake, duration_days, is_public }: CreateCommitmentPostParams) =>
      fetch('/functions/post-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, stake, duration_days, is_public }),
      }).then(res => res.json())
  })
}