import { useState, useEffect, useCallback, useRef } from 'react'
import { supabaseService, type Profile, type Quest, type CheckIn, type Ally, type AllyFeed, type Commitment } from '../lib/supabase-service'
import { User } from '@supabase/supabase-js'

export interface UseSupabaseReturn {
  // Authentication
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  
  // Profile
  profile: Profile | null
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>
  
  // Quests
  quests: Quest[]
  dailyQuest: Quest | null
  completeQuest: (questId: string, moodRating?: number, energyLevel?: number, reflection?: string) => Promise<{ data: any; error: any }>
  swapQuest: () => Promise<{ data: any; error: any }>
  
  // Check-ins
  checkIns: CheckIn[]
  todayCheckIn: CheckIn | null
  createCheckIn: (moodRating: number, energyLevel: number, notes?: string) => Promise<{ data: any; error: any }>
  
  // Allies
  allies: Ally[]
  potentialAllies: Profile[]
  allyRequests: (Ally & { profiles: Profile })[]
  sendAllyRequest: (allyId: string) => Promise<{ data: any; error: any }>
  acceptAllyRequest: (allyId: string) => Promise<{ data: any; error: any }>
  rejectAllyRequest: (allyId: string) => Promise<{ data: any; error: any }>
  
  // Ally Feed
  allyFeed: (AllyFeed & { profiles: Profile })[]
  createAllyFeedPost: (content: string, imageUrl?: string) => Promise<{ data: any; error: any }>
  
  // Commitments
  commitments: Commitment[]
  createCommitment: (title: string, description: string, targetDate: string) => Promise<{ data: any; error: any }>
  updateCommitment: (commitmentId: string, updates: Partial<Commitment>) => Promise<{ data: any; error: any }>
  
  // Analytics
  dashboardStats: any
  userAnalytics: any
  
  // Real-time
  subscribeToAllyFeed: (callback: (payload: any) => void) => void
  subscribeToAllyRequests: (callback: (payload: any) => void) => void
  subscribeToCommitments: (callback: (payload: any) => void) => void
  unsubscribeFromAllChannels: () => void
}

export function useSupabase(): UseSupabaseReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [dailyQuest, setDailyQuest] = useState<Quest | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null)
  const [allies, setAllies] = useState<Ally[]>([])
  const [potentialAllies, setPotentialAllies] = useState<Profile[]>([])
  const [allyRequests, setAllyRequests] = useState<(Ally & { profiles: Profile })[]>([])
  const [allyFeed, setAllyFeed] = useState<(AllyFeed & { profiles: Profile })[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)

  const mountedRef = useRef(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: currentUser } = await supabaseService.getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          await loadUserData(currentUser.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.client.auth.onAuthStateChange(
      async (event, session) => {
        if (mountedRef.current) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await loadUserData(session.user.id)
          } else {
            // Clear all data when user signs out
            setProfile(null)
            setQuests([])
            setDailyQuest(null)
            setCheckIns([])
            setTodayCheckIn(null)
            setAllies([])
            setPotentialAllies([])
            setAllyRequests([])
            setAllyFeed([])
            setCommitments([])
            setDashboardStats(null)
            setUserAnalytics(null)
          }
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  // Load user data when user changes
  const loadUserData = useCallback(async (userId: string) => {
    if (!mountedRef.current) return

    try {
      // Load profile
      const { data: profileData } = await supabaseService.getProfile(userId)
      if (profileData) setProfile(profileData)

      // Load quests
      const { data: questsData } = await supabaseService.getQuests()
      if (questsData) setQuests(questsData)

      // Load daily quest
      const { data: dailyQuestData } = await supabaseService.getDailyQuest()
      if (dailyQuestData) setDailyQuest(dailyQuestData)

      // Load check-ins
      const { data: checkInsData } = await supabaseService.getCheckIns(userId)
      if (checkInsData) setCheckIns(checkInsData)

      // Load today's check-in
      const { data: todayCheckInData } = await supabaseService.getTodayCheckIn(userId)
      if (todayCheckInData) setTodayCheckIn(todayCheckInData)

      // Load allies
      const { data: alliesData } = await supabaseService.getAcceptedAllies(userId)
      if (alliesData) setAllies(alliesData)

      // Load potential allies
      const { data: potentialAlliesData } = await supabaseService.getPotentialAllies(userId)
      if (potentialAlliesData) setPotentialAllies(potentialAlliesData)

      // Load ally requests
      const { data: allyRequestsData } = await supabaseService.getAllyRequests(userId)
      if (allyRequestsData) setAllyRequests(allyRequestsData)

      // Load ally feed
      const { data: allyFeedData } = await supabaseService.getAllyFeed(userId)
      if (allyFeedData) setAllyFeed(allyFeedData)

      // Load commitments
      const { data: commitmentsData } = await supabaseService.getCommitments(userId)
      if (commitmentsData) setCommitments(commitmentsData)

      // Load dashboard stats
      const { data: dashboardStatsData } = await supabaseService.getDashboardStats(userId)
      if (dashboardStatsData) setDashboardStats(dashboardStatsData)

      // Load user analytics
      const { data: userAnalyticsData } = await supabaseService.getUserAnalytics(userId)
      if (userAnalyticsData) setUserAnalytics(userAnalyticsData)

    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  // Authentication methods
  const signUp = useCallback(async (email: string, password: string) => {
    return await supabaseService.signUp(email, password)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    return await supabaseService.signIn(email, password)
  }, [])

  const signOut = useCallback(async () => {
    return await supabaseService.signOut()
  }, [])

  // Profile methods
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const result = await supabaseService.updateProfile(user.id, updates)
    if (result.data) {
      setProfile(result.data)
    }
    return result
  }, [user])

  // Quest methods
  const completeQuest = useCallback(async (questId: string, moodRating?: number, energyLevel?: number, reflection?: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const completion = {
      user_id: user.id,
      quest_id: questId,
      completed_at: new Date().toISOString(),
      mood_rating: moodRating,
      energy_level: energyLevel,
      reflection
    }
    
    const result = await supabaseService.completeQuest(completion)
    if (result.data) {
      // Refresh quests and daily quest
      const { data: questsData } = await supabaseService.getQuests()
      if (questsData) setQuests(questsData)
      
      const { data: dailyQuestData } = await supabaseService.getDailyQuest()
      if (dailyQuestData) setDailyQuest(dailyQuestData)
    }
    return result
  }, [user])

  const swapQuest = useCallback(async () => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const result = await supabaseService.swapQuest(user.id)
    if (result.data) {
      setDailyQuest(result.data)
    }
    return result
  }, [user])

  // Check-in methods
  const createCheckIn = useCallback(async (moodRating: number, energyLevel: number, notes?: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const checkIn = {
      user_id: user.id,
      check_in_date: new Date().toISOString().split('T')[0],
      mood_rating: moodRating,
      energy_level: energyLevel,
      notes
    }
    
    const result = await supabaseService.createCheckIn(checkIn)
    if (result.data) {
      setTodayCheckIn(result.data)
      setCheckIns(prev => [result.data, ...prev])
    }
    return result
  }, [user])

  // Ally methods
  const sendAllyRequest = useCallback(async (allyId: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const result = await supabaseService.sendAllyRequest(user.id, allyId)
    if (result.data) {
      // Refresh potential allies
      const { data: potentialAlliesData } = await supabaseService.getPotentialAllies(user.id)
      if (potentialAlliesData) setPotentialAllies(potentialAlliesData)
    }
    return result
  }, [user])

  const acceptAllyRequest = useCallback(async (allyId: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const result = await supabaseService.acceptAllyRequest(allyId)
    if (result.data) {
      // Refresh allies and requests
      const { data: alliesData } = await supabaseService.getAcceptedAllies(user.id)
      if (alliesData) setAllies(alliesData)
      
      const { data: allyRequestsData } = await supabaseService.getAllyRequests(user.id)
      if (allyRequestsData) setAllyRequests(allyRequestsData)
    }
    return result
  }, [user])

  const rejectAllyRequest = useCallback(async (allyId: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const result = await supabaseService.rejectAllyRequest(allyId)
    if (result.data) {
      // Refresh requests
      const { data: allyRequestsData } = await supabaseService.getAllyRequests(user.id)
      if (allyRequestsData) setAllyRequests(allyRequestsData)
    }
    return result
  }, [user])

  // Ally feed methods
  const createAllyFeedPost = useCallback(async (content: string, imageUrl?: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const post = {
      user_id: user.id,
      content,
      image_url: imageUrl
    }
    
    const result = await supabaseService.createAllyFeedPost(post)
    if (result.data) {
      setAllyFeed(prev => [result.data, ...prev])
    }
    return result
  }, [user])

  // Commitment methods
  const createCommitment = useCallback(async (title: string, description: string, targetDate: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') }
    
    const commitment = {
      user_id: user.id,
      title,
      description,
      target_date: targetDate,
      status: 'active' as const
    }
    
    const result = await supabaseService.createCommitment(commitment)
    if (result.data) {
      setCommitments(prev => [result.data, ...prev])
    }
    return result
  }, [user])

  const updateCommitment = useCallback(async (commitmentId: string, updates: Partial<Commitment>) => {
    const result = await supabaseService.updateCommitment(commitmentId, updates)
    if (result.data) {
      setCommitments(prev => prev.map(c => c.id === commitmentId ? result.data : c))
    }
    return result
  }, [])

  // Real-time subscription methods
  const subscribeToAllyFeed = useCallback((callback: (payload: any) => void) => {
    if (!user) return
    
    supabaseService.subscribeToAllyFeed(user.id, (payload) => {
      if (mountedRef.current) {
        callback(payload)
        // Refresh ally feed data
        loadUserData(user.id)
      }
    })
  }, [user, loadUserData])

  const subscribeToAllyRequests = useCallback((callback: (payload: any) => void) => {
    if (!user) return
    
    supabaseService.subscribeToAllyRequests(user.id, (payload) => {
      if (mountedRef.current) {
        callback(payload)
        // Refresh ally requests data
        loadUserData(user.id)
      }
    })
  }, [user, loadUserData])

  const subscribeToCommitments = useCallback((callback: (payload: any) => void) => {
    if (!user) return
    
    supabaseService.subscribeToCommitments(user.id, (payload) => {
      if (mountedRef.current) {
        callback(payload)
        // Refresh commitments data
        loadUserData(user.id)
      }
    })
  }, [user, loadUserData])

  const unsubscribeFromAllChannels = useCallback(() => {
    supabaseService.unsubscribeFromAllChannels()
  }, [])

  return {
    // Authentication
    user,
    loading,
    signUp,
    signIn,
    signOut,
    
    // Profile
    profile,
    updateProfile,
    
    // Quests
    quests,
    dailyQuest,
    completeQuest,
    swapQuest,
    
    // Check-ins
    checkIns,
    todayCheckIn,
    createCheckIn,
    
    // Allies
    allies,
    potentialAllies,
    allyRequests,
    sendAllyRequest,
    acceptAllyRequest,
    rejectAllyRequest,
    
    // Ally Feed
    allyFeed,
    createAllyFeedPost,
    
    // Commitments
    commitments,
    createCommitment,
    updateCommitment,
    
    // Analytics
    dashboardStats,
    userAnalytics,
    
    // Real-time
    subscribeToAllyFeed,
    subscribeToAllyRequests,
    subscribeToCommitments,
    unsubscribeFromAllChannels
  }
} 