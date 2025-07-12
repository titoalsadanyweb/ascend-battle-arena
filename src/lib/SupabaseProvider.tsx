import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSupabase } from '../hooks/useSupabase'
import { supabaseService } from './supabase-service'

interface SupabaseContextType {
  user: any
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  profile: any
  updateProfile: (updates: any) => Promise<{ data: any; error: any }>
  quests: any[]
  dailyQuest: any
  completeQuest: (questId: string, moodRating?: number, energyLevel?: number, reflection?: string) => Promise<{ data: any; error: any }>
  swapQuest: () => Promise<{ data: any; error: any }>
  checkIns: any[]
  todayCheckIn: any
  createCheckIn: (moodRating: number, energyLevel: number, notes?: string) => Promise<{ data: any; error: any }>
  allies: any[]
  potentialAllies: any[]
  allyRequests: any[]
  sendAllyRequest: (allyId: string) => Promise<{ data: any; error: any }>
  acceptAllyRequest: (allyId: string) => Promise<{ data: any; error: any }>
  rejectAllyRequest: (allyId: string) => Promise<{ data: any; error: any }>
  allyFeed: any[]
  createAllyFeedPost: (content: string, imageUrl?: string) => Promise<{ data: any; error: any }>
  commitments: any[]
  createCommitment: (title: string, description: string, targetDate: string) => Promise<{ data: any; error: any }>
  updateCommitment: (commitmentId: string, updates: any) => Promise<{ data: any; error: any }>
  dashboardStats: any
  userAnalytics: any
  subscribeToAllyFeed: (callback: (payload: any) => void) => void
  subscribeToAllyRequests: (callback: (payload: any) => void) => void
  subscribeToCommitments: (callback: (payload: any) => void) => void
  unsubscribeFromAllChannels: () => void
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const supabaseData = useSupabase()

  // Set up real-time subscriptions when user is authenticated
  useEffect(() => {
    if (supabaseData.user) {
      // Subscribe to ally feed updates
      supabaseData.subscribeToAllyFeed((payload) => {
        console.log('Ally feed update:', payload)
        // The hook will automatically refresh data
      })

      // Subscribe to ally request updates
      supabaseData.subscribeToAllyRequests((payload) => {
        console.log('Ally request update:', payload)
        // The hook will automatically refresh data
      })

      // Subscribe to commitment updates
      supabaseData.subscribeToCommitments((payload) => {
        console.log('Commitment update:', payload)
        // The hook will automatically refresh data
      })

      // Cleanup subscriptions on unmount
      return () => {
        supabaseData.unsubscribeFromAllChannels()
      }
    }
  }, [supabaseData.user])

  return (
    <SupabaseContext.Provider value={supabaseData}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider')
  }
  return context
} 