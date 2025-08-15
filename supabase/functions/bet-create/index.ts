import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { post_id, amount } = await req.json()
    
    // Validate input: amount must be positive
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be a positive number' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has already bet on this post
    const { data: existingBet } = await supabase
      .from('bets')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single()

    if (existingBet) {
      return new Response(JSON.stringify({ error: 'Already placed a bet on this post' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check user's token balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('id', user.id)
      .single()

    if (!profile || profile.token_balance < amount) {
      return new Response(JSON.stringify({ error: 'Insufficient token balance' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Start a transaction-like operation
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert([{ post_id, user_id: user.id, amount }])
      .select()
      .single()

    if (betError) {
      console.error('Bet creation error:', betError)
      return new Response(JSON.stringify({ error: 'Failed to create bet' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update user's token balance using RPC function
    const { error: balanceError } = await supabase.rpc('update_token_balance', {
      p_user_id: user.id,
      p_amount: -amount
    })

    if (balanceError) {
      console.error('Balance update error:', balanceError)
      // Rollback bet if balance update fails
      await supabase.from('bets').delete().eq('id', bet.id)
      return new Response(JSON.stringify({ error: 'Failed to update token balance' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(bet), { 
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})