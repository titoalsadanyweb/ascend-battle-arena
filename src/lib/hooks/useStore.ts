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
  icon_name: string
  requirements: {
    streak?: number
    achievements?: string[]
  }
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

export const useStoreItems = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['store-items', user?.id],
    queryFn: async (): Promise<StoreItem[]> => {
      // Get all store items
      const { data: items, error: itemsError } = await supabase
        .from('store_items')
        .select('*')
        .eq('is_active', true)
        .order('category, cost')

      if (itemsError) throw itemsError

      if (!user) {
        return items.map(item => ({
          ...item,
          requirements: item.requirements as any || {},
          owned: false
        })) as StoreItem[]
      }

      // Get user purchases to mark owned items
      const { data: purchases, error: purchasesError } = await supabase
        .from('user_purchases')
        .select('store_item_id')
        .eq('user_id', user.id)

      if (purchasesError) throw purchasesError

      const ownedItemIds = new Set(purchases.map(p => p.store_item_id))

      return items.map(item => ({
        ...item,
        requirements: item.requirements as any || {},
        owned: ownedItemIds.has(item.id)
      })) as StoreItem[]
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUserPurchases = () => {
  const { user } = useAuth()

  return useQuery({
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
        .order('purchased_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserPurchase[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export const usePurchaseItem = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('Not authenticated')

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
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      toast({
        title: "Purchase Successful!",
        description: `You've unlocked ${(data as any)?.item_name} for ${(data as any)?.cost} SIT`,
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
}