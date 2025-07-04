import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'))
  const { user_id } = await req.json()
  
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 })
  }

  try {
    // Get user's profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, best_streak, token_balance')
      .eq('id', user_id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 })
    }

    // Get check-in history for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('date, status, tokens_awarded')
      .eq('user_id', user_id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Check if user has checked in today
    const today = new Date().toISOString().split('T')[0]
    const hasCheckedInToday = checkIns?.some(c => c.date === today) || false

    return new Response(JSON.stringify({
      current_streak: profile.current_streak,
      best_streak: profile.best_streak,
      token_balance: profile.token_balance,
      has_checked_in_today: hasCheckedInToday,
      check_ins_history: checkIns || []
    }), { status: 200 })

  } catch (error) {
    console.error('Dashboard error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}) 