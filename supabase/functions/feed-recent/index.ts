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
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )
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

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

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

    return new Response(JSON.stringify(posts), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 