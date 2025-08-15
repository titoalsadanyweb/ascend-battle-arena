import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Crown, Shield, Star, Zap, Heart, Sword, Axe, Award, 
  Palette, Gem, Feather, Package 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserPurchases } from '@/lib/hooks/useStore'
import { format } from 'date-fns'

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

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'avatar': return <Crown className="h-4 w-4" />
    case 'armor': return <Shield className="h-4 w-4" />
    case 'weapon': return <Sword className="h-4 w-4" />
    case 'theme': return <Palette className="h-4 w-4" />
    case 'badge': return <Award className="h-4 w-4" />
    case 'special': return <Star className="h-4 w-4" />
    default: return <Package className="h-4 w-4" />
  }
}

const OwnedItemsSection: React.FC = () => {
  const { data: purchases, isLoading, error } = useUserPurchases()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
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
        <h3 className="font-medium text-muted-foreground mb-2">Error loading items</h3>
        <p className="text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    )
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-muted-foreground mb-2">No items owned yet</h3>
        <p className="text-sm text-muted-foreground">
          Purchase items from the store to build your collection!
        </p>
        <Button className="mt-4" variant="outline">
          Browse Store
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Your Arsenal</h3>
          <p className="text-muted-foreground">
            {purchases.length} item{purchases.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((purchase, index) => {
          if (!purchase.store_item) return null
          
          const item = purchase.store_item
          return (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden transition-all hover:shadow-lg bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getRarityColor(item.rarity)}`}>
                        {getIconComponent(item.icon_name)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRarityColor(item.rarity)} variant="outline">
                            {item.rarity}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Owned
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription>{item.description}</CardDescription>
                  
                  <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                    <span>Purchased</span>
                    <span>{format(new Date(purchase.purchased_at), 'MMM d, yyyy')}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
                    Equipped
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default OwnedItemsSection