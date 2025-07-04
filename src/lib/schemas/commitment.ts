import { z } from 'zod'

export const NewCommitmentSchema = z.object({
  content: z.string(),
  stake: z.number().positive(),
  duration_days: z.number().int().min(1).max(30),
  is_public: z.boolean().optional(),
}) 