import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'))
  const { user_id, date, status, is_edit } = await req.json()
  
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]
  const targetDate = date || today

  try {
    // Check if there's already a check-in for this date
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', targetDate)
      .single()

    if (existingCheckIn && !is_edit) {
      return new Response(JSON.stringify({ error: 'Already checked in for this date' }), { status: 400 })
    }

    // Calculate streak
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('date, status')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(30)

    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    // Sort check-ins by date for accurate streak calculation
    const sortedCheckIns = [...(checkIns || [])].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    for (const checkIn of sortedCheckIns) {
      if (checkIn.status === 'victory') {
        tempStreak++
        if (checkIn.date === targetDate) {
          currentStreak = tempStreak
        }
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

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
      date: targetDate,
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

    // Update user's token balance
    if (tokensAwarded > 0) {
      await supabase.rpc('update_token_balance', {
        p_user_id: user_id,
        p_amount: tokensAwarded
      })
    }

    return new Response(JSON.stringify({
      current_streak: currentStreak,
      best_streak: bestStreak,
      tokens_awarded: tokensAwarded,
      status
    }), { status: 200 })

  } catch (error) {
    console.error('Check-in error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}) 