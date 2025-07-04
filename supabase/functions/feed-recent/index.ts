import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'))
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content, media_url, created_at, type, user_id,
      profiles:user_id (username),
      bets ( user_id, amount ),
      comments (
        id, content, created_at, user_id,
        profiles:user_id (username)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })

  // Attach total_staked and user_has_bet flag
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user?.id

  const posts = (data || []).map(p => {
    const total = (p.bets || []).reduce((sum, b) => sum + b.amount, 0)
    const user_has_bet = (p.bets || []).some(b => b.user_id === uid)
    const comments = (p.comments || []).map(c => ({
      ...c,
      username: c.profiles?.username
    }))

    return {
      ...p,
      username: p.profiles?.username,
      total_staked: total,
      user_has_bet,
      comments
    }
  })

  return new Response(JSON.stringify(posts), { status: 200 })
}) 