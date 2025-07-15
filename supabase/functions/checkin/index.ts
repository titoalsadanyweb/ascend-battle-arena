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
    const { status, date, is_edit } = requestData
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
      .select('timezone')
      .eq('id', user_id)
      .single()

    // Use user's timezone to calculate local date
    const userTimezone = profile?.timezone || 'UTC'
    const today = new Date().toLocaleDateString('en-CA', { timeZone: userTimezone })
    const targetDate = date || today

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

    // Calculate streak
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('date_local, status')
      .eq('user_id', user_id)
      .order('date_local', { ascending: false })
      .limit(100)

    let currentStreak = 0
    let bestStreak = 0

    // Calculate streak properly from most recent consecutive victories
    if (status === 'victory') {
      currentStreak = 1
      
      // Count backwards from today for consecutive victories
      const orderedCheckIns = (checkIns || []).sort((a, b) => 
        new Date(b.date_local).getTime() - new Date(a.date_local).getTime()
      )
      
      for (let i = 0; i < orderedCheckIns.length; i++) {
        const checkIn = orderedCheckIns[i]
        if (checkIn.date_local === targetDate) continue // Skip today's entry
        
        const checkInDate = new Date(checkIn.date_local)
        const expectedDate = new Date(targetDate)
        expectedDate.setDate(expectedDate.getDate() - currentStreak)
        
        if (checkIn.date_local === expectedDate.toISOString().split('T')[0] && checkIn.status === 'victory') {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Get current best streak from profile
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('best_streak')
      .eq('id', user_id)
      .single()

    bestStreak = Math.max(currentProfile?.best_streak || 0, currentStreak)

    // Calculate tokens based on streak and status
    let tokensAwarded = 0
    if (status === 'victory') {
      tokensAwarded = 10 + (currentStreak > 1 ? (currentStreak - 1) * 5 : 0)
      
      // Add milestone bonuses
      if ([7, 14, 30, 60, 90].includes(currentStreak)) {
        tokensAwarded += 50
      }
    }

    // Insert or update check-in
    const checkInData = {
      user_id,
      date_local: targetDate,
      status,
      tokens_awarded: tokensAwarded,
      is_edited: is_edit || false
    }

    if (existingCheckIn) {
      await supabase
        .from('check_ins')
        .update(checkInData)
        .eq('id', existingCheckIn.id)
    } else {
      await supabase
        .from('check_ins')
        .insert([checkInData])
    }

    // Update user's profile with new streak and token balance
    await supabase
      .from('profiles')
      .update({
        current_streak: currentStreak,
        best_streak: bestStreak,
        token_balance: (currentProfile?.token_balance || 0) + tokensAwarded,
        last_check_in_date: targetDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    // Log token transaction
    if (tokensAwarded > 0) {
      await supabase
        .from('token_transactions')
        .insert({
          user_id,
          type: 'checkin_reward',
          amount: tokensAwarded
        })
    }

    return new Response(JSON.stringify({
      current_streak: currentStreak,
      best_streak: bestStreak,
      tokens_awarded: tokensAwarded,
      status,
      success: true
    }), { 
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