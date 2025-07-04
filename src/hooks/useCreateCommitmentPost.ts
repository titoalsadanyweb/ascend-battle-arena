import { useMutation } from '@tanstack/react-query'

export function useCreateCommitmentPost() {
  return useMutation(({ content, stake, duration_days, is_public }) =>
    fetch('/functions/post-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, stake, duration_days, is_public }),
    }).then(res => res.json())
  )
} 