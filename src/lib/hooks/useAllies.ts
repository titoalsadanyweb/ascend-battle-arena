
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface Ally {
  id: string
  user_id: string
  ally_id: string
  status: 'pending' | 'active' | 'inactive'
  paired_at: string
  ally_profile: {
    username: string
    current_streak: number
    last_check_in_date: string | null
  }
}

export interface AllyInvite {
  id: string
  username: string
  current_streak: number
  status: 'pending'
}

export const useAllies = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const alliesQuery = useQuery({
    queryKey: ['allies', user?.id],
    queryFn: async (): Promise<Ally[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('allies')
        .select(`
          *,
          ally_profile:profiles!allies_ally_id_fkey(
            username,
            current_streak,
            last_check_in_date
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (error) throw error
      return (data || []).map(row => ({
        ...row,
        status: row.status as 'pending' | 'active' | 'inactive'
      }))
    },
    enabled: !!user,
  })

  const pendingInvitesQuery = useQuery({
    queryKey: ['pending-invites', user?.id],
    queryFn: async (): Promise<AllyInvite[]> => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('allies')
        .select(`
          id,
          user_profile:profiles!allies_user_id_fkey(
            username,
            current_streak
          )
        `)
        .eq('ally_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      return (data || []).map(invite => ({
        id: invite.id,
        username: invite.user_profile?.username || 'Unknown',
        current_streak: invite.user_profile?.current_streak || 0,
        status: 'pending' as const
      }))
    },
    enabled: !!user,
  })

  const inviteAllyMutation = useMutation({
    mutationFn: async (username: string) => {
      if (!user) throw new Error('Not authenticated')

      // First, find the user by username
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single()

      if (userError || !targetUser) {
        throw new Error('User not found')
      }

      if (targetUser.id === user.id) {
        throw new Error('Cannot invite yourself as an ally')
      }

      // Check if already paired or invited
      const { data: existingRelation } = await supabase
        .from('allies')
        .select('*')
        .or(`and(user_id.eq.${user.id},ally_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},ally_id.eq.${user.id})`)

      if (existingRelation && existingRelation.length > 0) {
        throw new Error('Already connected or invite pending')
      }

      const { data, error } = await supabase
        .from('allies')
        .insert({
          user_id: user.id,
          ally_id: targetUser.id,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allies'] })
      toast({
        title: "Invite Sent",
        description: "Your battle ally invitation has been sent.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Invite Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const respondToInviteMutation = useMutation({
    mutationFn: async ({ inviteId, accept }: { inviteId: string; accept: boolean }) => {
      if (!user) throw new Error('Not authenticated')

      if (accept) {
        const { data, error } = await supabase
          .from('allies')
          .update({ status: 'active', paired_at: new Date().toISOString() })
          .eq('id', inviteId)
          .eq('ally_id', user.id)
          .select()
          .single()

        if (error) throw error

        // Create reciprocal relationship
        const { error: reciprocalError } = await supabase
          .from('allies')
          .insert({
            user_id: user.id,
            ally_id: data.user_id,
            status: 'active',
            paired_at: new Date().toISOString()
          })

        if (reciprocalError) throw reciprocalError
        return data
      } else {
        const { error } = await supabase
          .from('allies')
          .delete()
          .eq('id', inviteId)
          .eq('ally_id', user.id)

        if (error) throw error
      }
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['allies'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] })
      toast({
        title: accept ? "Ally Added" : "Invite Declined",
        description: accept 
          ? "You are now battle allies! Start your first commitment together."
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

  const removeAllyMutation = useMutation({
    mutationFn: async (allyId: string) => {
      if (!user) throw new Error('Not authenticated')

      // Remove both directions of the relationship
      const { error } = await supabase
        .from('allies')
        .delete()
        .or(`and(user_id.eq.${user.id},ally_id.eq.${allyId}),and(user_id.eq.${allyId},ally_id.eq.${user.id})`)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allies'] })
      toast({
        title: "Ally Removed",
        description: "Battle ally relationship ended.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Remove Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    allies: alliesQuery.data || [],
    pendingInvites: pendingInvitesQuery.data || [],
    isLoading: alliesQuery.isLoading || pendingInvitesQuery.isLoading,
    error: alliesQuery.error || pendingInvitesQuery.error,
    inviteAlly: inviteAllyMutation.mutate,
    respondToInvite: respondToInviteMutation.mutate,
    removeAlly: removeAllyMutation.mutate,
    isInviting: inviteAllyMutation.isPending,
    isResponding: respondToInviteMutation.isPending,
  }
}
