
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  
  // For development, create a mock client to prevent app crash
  if (import.meta.env.DEV) {
    console.warn('Creating mock Supabase client for development. Please set up your Supabase credentials.')
  } else {
    throw new Error('Missing Supabase environment variables')
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-anon-key'
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          timezone: string | null
          current_streak: number
          best_streak: number
          token_balance: number
          last_check_in_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          timezone?: string | null
          current_streak?: number
          best_streak?: number
          token_balance?: number
          last_check_in_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          timezone?: string | null
          current_streak?: number
          best_streak?: number
          token_balance?: number
          last_check_in_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
