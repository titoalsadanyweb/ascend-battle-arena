
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, Shirt, Palette, Crown, Shield, Star, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/hooks/useProfile'
import { toast } from '@/hooks/use-toast'

interface StoreItem {
  id: string
  name: string
  description: string
  cost: number
  category: 'avatar' | 'theme' | 'badge' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: React.ReactNode
  requirements?: {
    streak?: number
    achievements?: string[]
  }
  owned?: boolean
}

const TokenStore: React.FC = () => {
  const { profile } = useProfile()
  const [activeTab, setActiveTab] = useState('avatar')

  const storeItems: StoreItem[] = [
    // Avatar Themes
    {
      id: 'warrior_theme',
      name: 'Warrior Theme',
      description: 'Classic warrior avatar with armor',
      cost: 50,
      category: 'avatar',
      rarity: 'common',
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: 'champion_theme',
      name: 'Champion Theme',
      description: 'Golden champion avatar with crown',
      cost: 150,
      category: 'avatar',
      rarity: 'rare',
      icon: <Crown className="h-6 w-6" />,
      requirements: { streak: 7 }
    },
    {
      id: 'legend_theme',
      name: 'Legend Theme',
      description: 'Legendary avatar with special effects',
      cost: 500,
      category: 'avatar',
      rarity: 'legendary',
      icon: <Star className="h-6 w-6" />,
      requirements: { streak: 30 }
    },
    
    // Dashboard Themes
    {
      id: 'dark_theme',
      name: 'Dark Mode Theme',
      description: 'Sleek dark dashboard theme',
      cost: 25,
      category: 'theme',
      rarity: 'common',
      icon: <Palette className="h-6 w-6" />
    },
    {
      id: 'golden_theme',
      name: 'Golden Theme',
      description: 'Luxury golden dashboard theme',
      cost: 200,
      category: 'theme',
      rarity: 'epic',
      icon: <Palette className="h-6 w-6" />,
      requirements: { streak: 14 }
    },
    
    // Special Items
    {
      id: 'streak_protection',
      name: 'Streak Protection',
      description: 'One-time protection against streak loss',
      cost: 100,
      category: 'special',
      rarity: 'rare',
      icon: <Shield className="h-6 w-6" />
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const canPurchase = (item: StoreItem) => {
    if (item.owned) return false
    if ((profile?.token_balance || 0) < item.cost) return false
    if (item.requirements?.streak && (profile?.current_streak || 0) < item.requirements.streak) return false
    return true
  }

  const handlePurchase = (item: StoreItem) => {
    if (!canPurchase(item)) return
    
    // In real app, this would call an API to purchase the item
    toast({
      title: "Purchase Successful!",
      description: `You've unlocked ${item.name}`,
    })
  }

  const filteredItems = storeItems.filter(item => item.category === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Valor Shards Store</h2>
          <p className="text-muted-foreground">Customize your battle experience</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <Coins className="h-5 w-5 text-amber-600" />
          <span className="font-semibold text-amber-800">
            {profile?.token_balance || 0} SIT
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="avatar" className="gap-2">
            <Shirt className="h-4 w-4" />
            Avatars
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="badge" className="gap-2">
            <Star className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="special" className="gap-2">
            <Crown className="h-4 w-4" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  item.owned ? 'bg-green-50 border-green-200' : 'border-primary/20'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getRarityColor(item.rarity)}`}>
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Badge className={getRarityColor(item.rarity)} variant="outline">
                            {item.rarity}
                          </Badge>
                        </div>
                      </div>
                      {item.owned && (
                        <Badge className="bg-green-100 text-green-800">Owned</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription>{item.description}</CardDescription>
                    
                    {item.requirements && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="text-sm font-medium text-amber-800 mb-1">Requirements:</h4>
                        {item.requirements.streak && (
                          <p className="text-sm text-amber-700">
                            {item.requirements.streak}-day streak required
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-amber-800">
                          {item.cost} SIT
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={!canPurchase(item)}
                        variant={item.owned ? "secondary" : "default"}
                      >
                        {item.owned ? (
                          "Owned"
                        ) : !canPurchase(item) ? (
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </div>
                        ) : (
                          "Purchase"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-muted-foreground mb-2">No items available</h3>
              <p className="text-sm text-muted-foreground">
                Items for this category will be available soon!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TokenStore
