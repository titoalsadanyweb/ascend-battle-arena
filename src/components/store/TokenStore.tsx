
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Coins, Shirt, Palette, Crown, Shield, Star, Lock, 
  Zap, Heart, Sword, Axe, Award, Gem, Feather, Package 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/hooks/useProfile'
import { useStoreItems, usePurchaseItem, StoreItem } from '@/lib/hooks/useStore'
import OwnedItemsSection from './OwnedItemsSection'

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    crown: <Crown className="h-6 w-6" />,
    shield: <Shield className="h-6 w-6" />,
    star: <Star className="h-6 w-6" />,
    zap: <Zap className="h-6 w-6" />,
    heart: <Heart className="h-6 w-6" />,
    sword: <Sword className="h-6 w-6" />,
    axe: <Axe className="h-6 w-6" />,
    award: <Award className="h-6 w-6" />,
    palette: <Palette className="h-6 w-6" />,
    gem: <Gem className="h-6 w-6" />,
    feather: <Feather className="h-6 w-6" />,
  }
  return iconMap[iconName] || <Package className="h-6 w-6" />
}

const TokenStore: React.FC = () => {
  const { profile } = useProfile()
  const { data: storeItems, isLoading, error } = useStoreItems()
  const purchaseItem = usePurchaseItem()
  const [activeTab, setActiveTab] = useState('avatar')

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
    purchaseItem.mutate(item.id)
  }

  const filteredItems = storeItems?.filter(item => item.category === activeTab) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Valor Shards Store</h2>
            <p className="text-muted-foreground">Customize your battle experience</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-muted-foreground mb-2">Error loading store</h3>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    )
  }

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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="avatar" className="gap-2">
            <Shirt className="h-4 w-4" />
            Avatars
          </TabsTrigger>
          <TabsTrigger value="armor" className="gap-2">
            <Shield className="h-4 w-4" />
            Armor
          </TabsTrigger>
          <TabsTrigger value="weapon" className="gap-2">
            <Sword className="h-4 w-4" />
            Weapons
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
          <TabsTrigger value="owned" className="gap-2">
            <Package className="h-4 w-4" />
            Owned
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owned" className="mt-6">
          <OwnedItemsSection />
        </TabsContent>

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
                          {getIconComponent(item.icon_name)}
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
                    
                    {item.requirements && Object.keys(item.requirements).length > 0 && (
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
                        disabled={!canPurchase(item) || purchaseItem.isPending}
                        variant={item.owned ? "secondary" : "default"}
                      >
                        {purchaseItem.isPending ? (
                          "Purchasing..."
                        ) : item.owned ? (
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
          
          {filteredItems.length === 0 && activeTab !== 'owned' && (
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
