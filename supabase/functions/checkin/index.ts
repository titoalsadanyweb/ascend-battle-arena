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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the Authorization header and extract the user
    const authHeader = req.headers.get('Authorization')
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

    const requestData = await req.json()
    const { status, date, is_edit, mood, energy, reflection } = requestData
    const user_id = user.id
  
    if (!status) {
      return new Response(JSON.stringify({ error: 'Status required' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user's timezone from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone, current_streak')
      .eq('id', user_id)
      .single()

    // Use user's timezone to calculate local date
    const userTimezone = profile?.timezone || 'UTC'
    const today = new Date().toLocaleDateString('en-CA', { timeZone: userTimezone })
    const targetDate = date || today
    const currentStreak = profile?.current_streak || 0

    // Calculate milestone bonus
    let milestoneBonus = 0
    if (status === 'victory') {
      const newStreak = currentStreak + 1
      if ([7, 14, 30, 60, 90].includes(newStreak)) {
        milestoneBonus = 50
      }
    }

    // Check if there's already a check-in for this date
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user_id)
      .eq('date_local', targetDate)
      .maybeSingle()

    if (existingCheckIn && !is_edit) {
      return new Response(JSON.stringify({ error: 'Already checked in for this date' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use the database function to handle check-in with proper RLS context
    const { data: result, error: checkInError } = await supabase.rpc('handle_checkin_with_rls', {
      p_user_id: user_id,
      p_date_local: targetDate,
      p_status: status,
      p_tokens_awarded: status === 'victory' ? (10 + Math.max(0, (currentStreak - 1) * 5) + (milestoneBonus || 0)) : 0,
      p_is_edit: is_edit || false
    })

    if (checkInError) {
      console.error('Check-in database error:', checkInError)
      return new Response(JSON.stringify({ 
        error: 'Check-in failed',
        details: checkInError.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})