import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'))
  const { post_id, amount } = await req.json()
  const { data: { user } } = await supabase.auth.getUser()
  const user_id = user?.id

  if (!user_id) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }

  // Check if user has already bet on this post
  const { data: existingBet } = await supabase
    .from('bets')
    .select('id')
    .eq('post_id', post_id)
    .eq('user_id', user_id)
    .single()

  if (existingBet) {
    return new Response(JSON.stringify({ error: 'Already placed a bet on this post' }), { status: 400 })
  }

  // Check user's token balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('token_balance')
    .eq('id', user_id)
    .single()

  if (!profile || profile.token_balance < amount) {
    return new Response(JSON.stringify({ error: 'Insufficient token balance' }), { status: 400 })
  }

  // Start a transaction
  const { data: bet, error: betError } = await supabase
    .from('bets')
    .insert([{ post_id, user_id, amount }])
    .select()
    .single()

  if (betError) {
    return new Response(JSON.stringify({ error: betError }), { status: 500 })
  }

  // Update user's token balance
  const { error: balanceError } = await supabase.rpc('update_token_balance', {
    p_user_id: user_id,
    p_amount: -amount
  })

  if (balanceError) {
    // Rollback bet if balance update fails
    await supabase.from('bets').delete().eq('id', bet.id)
    return new Response(JSON.stringify({ error: 'Failed to update token balance' }), { status: 500 })
  }

  return new Response(JSON.stringify(bet), { status: 201 })
}) 