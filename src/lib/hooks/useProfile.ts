
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface Profile {
  id: string
  username: string
  timezone: string
  current_streak: number
  best_streak: number
  token_balance: number
  last_check_in_date: string | null
  created_at: string
  updated_at: string
  language: string
  secondary_language: string | null
  religion: string | null
  bio: string | null
  country: string | null
  looking_for_ally: boolean
  match_preferences: any
  preferred_languages: string[]
  preferred_religions: string[]
  preferred_countries: string[]
  nationality_preference: 'same_country' | 'no_preference'
}

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null
      
      console.log('Fetching profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        // Don't throw on "no rows" error, just return null
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      console.log('Profile fetch result:', data)
      // Cast the nationality_preference to the correct type
      if (data) {
        return {
          ...data,
          nationality_preference: (data.nationality_preference as 'same_country' | 'no_preference') || 'no_preference'
        } as Profile
      }
      return data as Profile
    },
    enabled: !!user && !authLoading,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a "no profile found" error
      if (error?.code === 'PGRST116') return false
      // Only retry network errors, max 2 times
      return failureCount < 2
    },
  })

  const createProfileMutation = useMutation({
    mutationFn: async ({ username, timezone }: { username: string; timezone: string }) => {
      if (!user) throw new Error('No authenticated user')

      console.log('Creating profile for user:', user.id, 'with username:', username, 'timezone:', timezone)

      // Check if username is already taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existingProfile) {
        throw new Error('Username is already taken')
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          timezone,
          current_streak: 0,
          best_streak: 0,
          token_balance: 0,
          language: 'English',
          secondary_language: null,
          looking_for_ally: true,
          match_preferences: {},
          preferred_languages: ['English'],
          preferred_religions: [],
          preferred_countries: [],
          nationality_preference: 'no_preference'
        })
        .select()
        .single()

      if (error) {
        console.error('Profile creation error:', error)
        throw error
      }
      
      console.log('Profile created successfully:', data)
      return data as Profile
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data)
      toast({
        title: "Welcome to Ascend Arena!",
        description: "Your battle station is ready. Time to declare victory!",
      })
    },
    onError: (error: Error) => {
      console.error('Profile creation mutation error:', error)
      toast({
        title: "Profile Creation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('No authenticated user')

      // If updating username, check if it's already taken
      if (updates.username) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', updates.username)
          .neq('id', user.id)
          .maybeSingle()

        if (existingProfile) {
          throw new Error('Username is already taken')
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data)
      toast({
        title: "Profile Updated",
        description: "Your battle profile has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createProfile: createProfileMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
  }
}
