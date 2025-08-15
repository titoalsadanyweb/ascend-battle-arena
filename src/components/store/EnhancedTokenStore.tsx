import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Coins, 
  Shirt, 
  Palette, 
  Crown, 
  Shield, 
  Star, 
  Lock, 
  Sword,
  Award,
  Zap,
  Heart,
  Gem,
  Feather
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/hooks/useProfile'
import { useStore } from '@/lib/hooks/useStore'
import { Separator } from '@/components/ui/separator'

const getIconComponent = (iconName: string | null) => {
  const iconMap: Record<string, React.ReactNode> = {
    shield: <Shield className="h-6 w-6" />,
    crown: <Crown className="h-6 w-6" />,
    star: <Star className="h-6 w-6" />,
    sword: <Sword className="h-6 w-6" />,
    palette: <Palette className="h-6 w-6" />,
    award: <Award className="h-6 w-6" />,
    zap: <Zap className="h-6 w-6" />,
    heart: <Heart className="h-6 w-6" />,
    gem: <Gem className="h-6 w-6" />,
    feather: <Feather className="h-6 w-6" />,
  }
  
  return iconMap[iconName || 'shield'] || <Shield className="h-6 w-6" />
}

const EnhancedTokenStore: React.FC = () => {
  const { profile } = useProfile()
  const { storeItems, userPurchases, purchaseItem, isPurchasing, isLoading } = useStore()
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

  const canPurchase = (item: any) => {
    if (item.owned) return false
    if ((profile?.token_balance || 0) < item.cost) return false
    if (item.requirements?.streak && (profile?.current_streak || 0) < item.requirements.streak) return false
    return true
  }

  const filteredItems = storeItems.filter(item => item.category === activeTab)
  const ownedItems = userPurchases.filter(purchase => purchase.store_item?.category === activeTab)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Valor Shards Store</h2>
          <p className="text-muted-foreground">Customize your battle experience with warrior gear</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <Coins className="h-5 w-5 text-amber-600" />
          <span className="font-semibold text-amber-800">
            {profile?.token_balance || 0} SIT
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
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
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Owned Items Section */}
          {ownedItems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Your Arsenal</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {ownedItems.map((purchase, index) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="bg-green-50 border-green-200 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getRarityColor(purchase.store_item?.rarity || 'common')}`}>
                            {getIconComponent(purchase.store_item?.icon_name || null)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{purchase.store_item?.name}</p>
                            <Badge className="bg-green-100 text-green-800 text-xs">Equipped</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Store Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    item.owned ? 'bg-green-50 border-green-200 opacity-75' : 'border-primary/20 hover:border-primary/40'
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
                      
                      {item.requirements?.streak && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <h4 className="text-sm font-medium text-amber-800 mb-1">Requirements:</h4>
                          <p className="text-sm text-amber-700">
                            {item.requirements.streak}-day streak required
                          </p>
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
                          onClick={() => purchaseItem(item.id)}
                          disabled={!canPurchase(item) || isPurchasing}
                          variant={item.owned ? "secondary" : "default"}
                          size="sm"
                        >
                          {item.owned ? (
                            "Owned"
                          ) : !canPurchase(item) ? (
                            <div className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </div>
                          ) : isPurchasing ? (
                            "Purchasing..."
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedTokenStore