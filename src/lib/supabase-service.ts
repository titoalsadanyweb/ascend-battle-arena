import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aslozlmjcnxvwzskhtgy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbG96bG1qY254dnd6c2todGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjc0ODksImV4cCI6MjA2NTUwMzQ4OX0.yOfShEp2H4JOg23r7Vmqd15wOwlbhBaCTicpTV2qIcg'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
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

export interface Quest {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  token_reward: number
  created_at: string
}

export interface QuestCompletion {
  id: string
  user_id: string
  quest_id: string
  completed_at: string
  mood_rating?: number
  energy_level?: number
  reflection?: string
}

export interface CheckIn {
  id: string
  user_id: string
  check_in_date: string
  mood_rating: number
  energy_level: number
  notes?: string
  created_at: string
}

export interface Ally {
  id: string
  user_id: string
  ally_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface AllyFeed {
  id: string
  user_id: string
  content: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Commitment {
  id: string
  user_id: string
  title: string
  description: string
  target_date: string
  status: 'active' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

// Supabase Service Class
export class SupabaseService {
  private client: SupabaseClient
  private realtimeChannels: Map<string, RealtimeChannel> = new Map()

  constructor() {
    this.client = supabase
  }

  // Authentication
  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    return { error }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser()
    return { user, error }
  }

  // Profile Management
  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>) {
    const { data, error } = await this.client
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  }

  // Quest Management
  async getQuests() {
    const { data, error } = await this.client
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  }

  async getQuestById(questId: string) {
    const { data, error } = await this.client
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single()
    return { data, error }
  }

  async getDailyQuest() {
    const { data, error } = await this.client
      .rpc('get_daily_quest')
    return { data, error }
  }

  async completeQuest(completion: Omit<QuestCompletion, 'id'>) {
    const { data, error } = await this.client
      .from('quest_completions')
      .insert(completion)
      .select()
      .single()
    return { data, error }
  }

  async swapQuest(userId: string) {
    const { data, error } = await this.client
      .rpc('swap_quest', { user_id: userId })
    return { data, error }
  }

  // Check-in Management
  async createCheckIn(checkIn: Omit<CheckIn, 'id' | 'created_at'>) {
    const { data, error } = await this.client
      .from('check_ins')
      .insert(checkIn)
      .select()
      .single()
    return { data, error }
  }

  async getCheckIns(userId: string) {
    const { data, error } = await this.client
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('check_in_date', { ascending: false })
    return { data, error }
  }

  async getTodayCheckIn(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await this.client
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('check_in_date', today)
      .single()
    return { data, error }
  }

  // Ally Management
  async getPotentialAllies(userId: string) {
    const { data, error } = await this.client
      .rpc('find_potential_allies', { user_id: userId })
    return { data, error }
  }

  async sendAllyRequest(userId: string, allyId: string) {
    const { data, error } = await this.client
      .from('allies')
      .insert({
        user_id: userId,
        ally_id: allyId,
        status: 'pending'
      })
      .select()
      .single()
    return { data, error }
  }

  async getAllyRequests(userId: string) {
    const { data, error } = await this.client
      .from('allies')
      .select(`
        *,
        profiles!allies_user_id_fkey(*)
      `)
      .eq('ally_id', userId)
      .eq('status', 'pending')
    return { data, error }
  }

  async acceptAllyRequest(allyId: string) {
    const { data, error } = await this.client
      .from('allies')
      .update({ status: 'accepted' })
      .eq('id', allyId)
      .select()
      .single()
    return { data, error }
  }

  async rejectAllyRequest(allyId: string) {
    const { data, error } = await this.client
      .from('allies')
      .update({ status: 'rejected' })
      .eq('id', allyId)
      .select()
      .single()
    return { data, error }
  }

  async getAcceptedAllies(userId: string) {
    const { data, error } = await this.client
      .from('allies')
      .select(`
        *,
        profiles!allies_ally_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
    return { data, error }
  }

  // Ally Feed Management
  async createAllyFeedPost(post: Omit<AllyFeed, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.client
      .from('ally_feed')
      .insert(post)
      .select()
      .single()
    return { data, error }
  }

  async getAllyFeed(userId: string) {
    const { data, error } = await this.client
      .from('ally_feed')
      .select(`
        *,
        profiles!ally_feed_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }

  // Commitment Management
  async createCommitment(commitment: Omit<Commitment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.client
      .from('commitments')
      .insert(commitment)
      .select()
      .single()
    return { data, error }
  }

  async getCommitments(userId: string) {
    const { data, error } = await this.client
      .from('commitments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  }

  async updateCommitment(commitmentId: string, updates: Partial<Commitment>) {
    const { data, error } = await this.client
      .from('commitments')
      .update(updates)
      .eq('id', commitmentId)
      .select()
      .single()
    return { data, error }
  }

  // Real-time Subscriptions
  subscribeToAllyFeed(userId: string, callback: (payload: any) => void) {
    const channel = this.client
      .channel(`ally_feed_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ally_feed',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    this.realtimeChannels.set(`ally_feed_${userId}`, channel)
    return channel
  }

  subscribeToAllyRequests(userId: string, callback: (payload: any) => void) {
    const channel = this.client
      .channel(`ally_requests_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'allies',
          filter: `ally_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    this.realtimeChannels.set(`ally_requests_${userId}`, channel)
    return channel
  }

  subscribeToCommitments(userId: string, callback: (payload: any) => void) {
    const channel = this.client
      .channel(`commitments_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commitments',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    this.realtimeChannels.set(`commitments_${userId}`, channel)
    return channel
  }

  // Unsubscribe from real-time channels
  unsubscribeFromChannel(channelName: string) {
    const channel = this.realtimeChannels.get(channelName)
    if (channel) {
      this.client.removeChannel(channel)
      this.realtimeChannels.delete(channelName)
    }
  }

  unsubscribeFromAllChannels() {
    this.realtimeChannels.forEach((channel, name) => {
      this.client.removeChannel(channel)
    })
    this.realtimeChannels.clear()
  }

  // Analytics and Dashboard
  async getDashboardStats(userId: string) {
    const { data, error } = await this.client
      .rpc('get_dashboard_stats', { user_id: userId })
    return { data, error }
  }

  async getUserAnalytics(userId: string) {
    const { data, error } = await this.client
      .rpc('get_user_analytics', { user_id: userId })
    return { data, error }
  }

  // Token Management
  async getTokenBalance(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('token_balance')
      .eq('id', userId)
      .single()
    return { data, error }
  }

  async updateTokenBalance(userId: string, amount: number) {
    const { data, error } = await this.client
      .rpc('update_token_balance', { 
        user_id: userId, 
        amount: amount 
      })
    return { data, error }
  }

  // Utility Functions
  async uploadImage(file: File, bucket: string = 'images') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) return { data: null, error }

    const { data: urlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { data: urlData.publicUrl, error: null }
  }

  // Error handling utility
  handleError(error: any) {
    console.error('Supabase error:', error)
    return {
      message: error?.message || 'An unexpected error occurred',
      code: error?.code || 'UNKNOWN_ERROR'
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()

// Avoid export conflicts by not re-exporting types
// Use the interfaces defined above or import directly from types file in components