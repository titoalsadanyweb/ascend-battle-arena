import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

interface CheckInOptions {
  status: 'victory' | 'defeat'
  date?: string
  isEdit?: boolean
}

export const useCheckIn = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const checkInMutation = useMutation({
    mutationFn: async ({ status, date, isEdit }: CheckInOptions) => {
      if (!user) throw new Error('Not authenticated')
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      console.log('Initiating check-in for user:', user.id, 'status:', status, 'date:', date, 'isEdit:', isEdit)

      const response = await fetch(
        `https://aslozlmjcnxvwzskhtgy.supabase.co/functions/v1/checkin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            status,
            date,
            is_edit: isEdit
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Check-in error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: 'Check-in failed: ' + errorText }
        }
        throw new Error(errorData.error || 'Check-in failed')
      }

      const data = await response.json()
      console.log('Check-in response data:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('Check-in successful:', data)
      
      // Invalidate and refetch relevant queries immediately
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      // Force immediate refetch of dashboard data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['dashboard'] })
      }, 100)
      
      // Show success toast with streak information
      const isNewRecord = data.current_streak === data.best_streak && data.current_streak > 1
      const isMilestone = [7, 14, 30, 60, 90].includes(data.current_streak)
      
      let toastTitle = data.status === 'victory' ? "Victory Declared!" : "Defeat Acknowledged"
      let toastDescription = data.status === 'victory' 
        ? `Day ${data.current_streak} streak! +${data.tokens_awarded} Valor Shards earned.`
        : "Your streak has been reset. Stay strong!"
      
      if (isNewRecord && data.status === 'victory') {
        toastTitle = "🏆 NEW RECORD!"
        toastDescription = `Personal best: ${data.current_streak} days! +${data.tokens_awarded} Valor Shards earned.`
      } else if (isMilestone && data.status === 'victory') {
        toastTitle = "🎯 MILESTONE ACHIEVED!"
        toastDescription = `${data.current_streak} day milestone reached! +${data.tokens_awarded} Valor Shards (bonus included)!`
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
      })
    },
    onError: (error: Error) => {
      console.error('Check-in mutation error:', error)
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    checkIn: (options: CheckInOptions) => checkInMutation.mutate(options),
    isCheckingIn: checkInMutation.isPending,
    error: checkInMutation.error,
  }
}
