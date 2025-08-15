import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../AuthProvider'
import { toast } from '@/hooks/use-toast'

export interface StoreItem {
  id: string
  name: string
  description: string
  cost: number
  category: 'avatar' | 'theme' | 'badge' | 'special' | 'armor' | 'weapon'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon_name: string | null
  requirements: any
  is_active: boolean
  owned?: boolean
}

export interface UserPurchase {
  id: string
  user_id: string
  store_item_id: string
  purchased_at: string
  store_item?: StoreItem
}

export const useStore = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all store items
  const storeItemsQuery = useQuery({
    queryKey: ['store-items'],
    queryFn: async (): Promise<StoreItem[]> => {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('cost', { ascending: true })

      if (error) throw error
      return (data as StoreItem[]) || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch user's purchases
  const userPurchasesQuery = useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async (): Promise<UserPurchase[]> => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          store_item:store_items(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error
      return (data as UserPurchase[]) || []
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.rpc('purchase_store_item', {
        p_item_id: itemId
      })

      if (error) throw error

      const result = data as any
      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      toast({
        title: "Purchase Successful! 🎉",
        description: `You've unlocked ${data.item_name}`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Merge store items with ownership info
  const itemsWithOwnership = storeItemsQuery.data?.map(item => ({
    ...item,
    owned: userPurchasesQuery.data?.some(purchase => purchase.store_item_id === item.id) || false
  })) || []

  return {
    storeItems: itemsWithOwnership,
    userPurchases: userPurchasesQuery.data || [],
    isLoading: storeItemsQuery.isLoading || userPurchasesQuery.isLoading,
    purchaseItem: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    error: storeItemsQuery.error || userPurchasesQuery.error,
  }
}