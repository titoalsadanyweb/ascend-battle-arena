
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface PotentialAlly {
  user_id: string
  username: string
  language: string
  secondary_language: string | null
  religion: string | null
  bio: string | null
  current_streak: number
  best_streak: number
  timezone: string
  match_score: number
  country?: string | null
}

export interface AllyInvitation {
  id: string
  user_id: string
  ally_id: string
  status: 'pending' | 'active' | 'inactive'
  paired_at: string
  ally_profile?: {
    username: string
    language: string
    secondary_language: string | null
    religion: string | null
    current_streak: number
    country?: string | null
  }
  user_profile?: {
    username: string
    language: string
    secondary_language: string | null
    religion: string | null
    current_streak: number
    country?: string | null
  }
}

export const useAllyMatching = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get potential allies using the database function
  const potentialAlliesQuery = useQuery({
    queryKey: ['potential-allies', user?.id],
    queryFn: async (): Promise<PotentialAlly[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase.rpc('find_potential_allies', {
        p_user_id: user.id,
        p_limit: 20
      })

      if (error) throw error

      return (data || []).map(ally => ({
        user_id: ally.user_id,
        username: ally.username || 'Unknown',
        language: ally.language || 'English',
        secondary_language: ally.secondary_language || null,
        religion: ally.religion,
        bio: ally.bio,
        current_streak: ally.current_streak,
        best_streak: ally.best_streak,
        timezone: ally.timezone || 'UTC',
        match_score: ally.match_score,
        country: null // Will be added when we update the function
      }))
    },
    enabled: !!user,
  })

  // Get pending invitations (sent to user)
  const receivedInvitationsQuery = useQuery({
    queryKey: ['received-invitations', user?.id],
    queryFn: async (): Promise<AllyInvitation[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('allies')
        .select(`
          *,
          user_profile:profiles!allies_user_id_fkey(
            username,
            language,
            secondary_language,
            religion,
            current_streak,
            country
          )
        `)
        .eq('ally_id', user.id)
        .eq('status', 'pending')
        .order('paired_at', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        ally_id: item.ally_id,
        status: (item.status as 'pending' | 'active' | 'inactive'),
        paired_at: item.paired_at,
        user_profile: item.user_profile ? {
          username: item.user_profile.username || 'Unknown',
          language: item.user_profile.language || 'English',
          secondary_language: item.user_profile.secondary_language || null,
          religion: item.user_profile.religion,
          current_streak: item.user_profile.current_streak || 0,
          country: item.user_profile.country
        } : undefined
      }))
    },
    enabled: !!user,
  })

  // Get sent invitations
  const sentInvitationsQuery = useQuery({
    queryKey: ['sent-invitations', user?.id],
    queryFn: async (): Promise<AllyInvitation[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('allies')
        .select(`
          *,
          ally_profile:profiles!allies_ally_id_fkey(
            username,
            language,
            secondary_language,
            religion,
            current_streak,
            country
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('paired_at', { ascending: false })

      if (error) throw error
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        ally_id: item.ally_id,
        status: (item.status as 'pending' | 'active' | 'inactive'),
        paired_at: item.paired_at,
        ally_profile: item.ally_profile ? {
          username: item.ally_profile.username || 'Unknown',
          language: item.ally_profile.language || 'English',
          secondary_language: item.ally_profile.secondary_language || null,
          religion: item.ally_profile.religion,
          current_streak: item.ally_profile.current_streak || 0,
          country: item.ally_profile.country
        } : undefined
      }))
    },
    enabled: !!user,
  })

  // Send invitation by finding user and creating ally relationship
  const sendInvitationMutation = useMutation({
    mutationFn: async ({ targetUserId, message }: { targetUserId: string; message?: string }) => {
      if (!user) throw new Error('Not authenticated')

      // Check if relationship already exists
      const { data: existing, error: checkError } = await supabase
        .from('allies')
        .select('*')
        .or(`and(user_id.eq.${user.id},ally_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},ally_id.eq.${user.id})`)

      if (checkError) throw checkError
      if (existing && existing.length > 0) {
        throw new Error('Already connected or invitation pending')
      }

      const { data, error } = await supabase
        .from('allies')
        .insert({
          user_id: user.id,
          ally_id: targetUserId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['potential-allies'] })
      toast({
        title: "Battle Invitation Sent",
        description: "Your battle ally invitation has been sent!",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Invitation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Respond to invitation
  const respondToInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, accept }: { invitationId: string; accept: boolean }) => {
      if (!user) throw new Error('Not authenticated')

      if (accept) {
        // Update invitation status to active
        const { data: invitation, error: updateError } = await supabase
          .from('allies')
          .update({ status: 'active', paired_at: new Date().toISOString() })
          .eq('id', invitationId)
          .eq('ally_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError

        // Create reciprocal relationship
        const { error: reciprocalError } = await supabase
          .from('allies')
          .insert({
            user_id: user.id,
            ally_id: invitation.user_id,
            status: 'active',
            paired_at: new Date().toISOString()
          })

        if (reciprocalError) throw reciprocalError
        return invitation
      } else {
        // Delete the invitation
        const { error } = await supabase
          .from('allies')
          .delete()
          .eq('id', invitationId)
          .eq('ally_id', user.id)

        if (error) throw error
      }
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['received-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['allies'] })
      toast({
        title: accept ? "Battle Ally Added" : "Invitation Declined",
        description: accept 
          ? "You are now battle allies! Start supporting each other."
          : "Invitation declined.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Response Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    potentialAllies: potentialAlliesQuery.data || [],
    receivedInvitations: receivedInvitationsQuery.data || [],
    sentInvitations: sentInvitationsQuery.data || [],
    isLoading: potentialAlliesQuery.isLoading || receivedInvitationsQuery.isLoading || sentInvitationsQuery.isLoading,
    sendInvitation: sendInvitationMutation.mutate,
    respondToInvitation: respondToInvitationMutation.mutate,
    isSending: sendInvitationMutation.isPending,
    isResponding: respondToInvitationMutation.isPending,
  }
}
