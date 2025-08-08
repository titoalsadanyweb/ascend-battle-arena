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
    const authHeader = req.headers.get('Authorization') || ''

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Validate auth header and extract the user
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const user_id = user.id
  
    // Get user's timezone from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, best_streak, token_balance, last_check_in_date, timezone')
      .eq('id', user_id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use user's timezone to calculate local date
    const userTimezone = profile.timezone || 'UTC'
    const today = new Date().toLocaleDateString('en-CA', { timeZone: userTimezone })

    // Get check-in history for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('date_local, status, tokens_awarded')
      .eq('user_id', user_id)
      .gte('date_local', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date_local', { ascending: false })

    // Check if user has checked in today using local date
    const hasCheckedInToday = checkIns?.some(c => c.date_local === today) || false

    return new Response(JSON.stringify({
      current_streak: profile.current_streak,
      best_streak: profile.best_streak,
      token_balance: profile.token_balance,
      has_checked_in_today: hasCheckedInToday,
      check_ins_history: checkIns || []
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})