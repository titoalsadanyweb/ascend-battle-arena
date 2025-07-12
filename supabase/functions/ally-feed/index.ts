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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get ally feed events for the current user
    const { data: feedEvents, error } = await supabase
      .from('ally_feed')
      .select(`
        id,
        event_type,
        details,
        created_at,
        metadata,
        user_profile:profiles!ally_feed_user_id_fkey(username)
      `)
      .eq('ally_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching ally feed:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch ally feed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format the events for the frontend
    const formattedEvents = (feedEvents || []).map(event => ({
      id: event.id,
      event_type: event.event_type,
      actor_username: event.user_profile?.username || 'Unknown',
      details: event.details,
      timestamp: event.created_at,
      metadata: event.metadata
    }))

    return new Response(
      JSON.stringify(formattedEvents),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})