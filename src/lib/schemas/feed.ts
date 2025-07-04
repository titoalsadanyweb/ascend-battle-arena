import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  media_url: z.string().nullable(),
  created_at: z.string(),
  user_id: z.string(),
  total_staked: z.number(),
  user_has_bet: z.boolean(),
})

export const BetSchema = z.object({
  post_id: z.string().uuid(),
  amount: z.number().positive(),
}) 