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
    
    const body = await req.json()
    const { content, media_url, post_id, type = 'general' } = body
    const { data: { user } } = await supabase.auth.getUser()
    const user_id = user?.id

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  if (post_id) {
    // Create a comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{ post_id, user_id, content }])
      .select(`
        id, content, created_at, user_id,
        profiles:user_id (username)
      `)
      .single()

      if (commentError) {
        return new Response(JSON.stringify({ error: commentError }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        ...comment,
        username: comment.profiles?.username
      }), { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
  } else {
    // Create a post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([{ user_id, content, media_url, type }])
      .select(`
        id, content, media_url, created_at, type, user_id,
        profiles:user_id (username)
      `)
      .single()

      if (postError) {
        return new Response(JSON.stringify({ error: postError }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        ...post,
        username: post.profiles?.username,
        total_staked: 0,
        user_has_bet: false,
        comments: []
      }), { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 