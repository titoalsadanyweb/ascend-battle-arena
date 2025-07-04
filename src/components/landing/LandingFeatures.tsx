
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, Users, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Swords,
    title: 'Daily Battles',
    description: 'Declare victory each day. Build unstoppable streaks. Earn Valor Shards with every triumph.'
  },
  {
    icon: Users,
    title: 'Battle Allies',
    description: 'Find your accountability partner. Support each other. Win together or learn from defeats.'
  },
  {
    icon: Trophy,
    title: 'Epic Rewards',
    description: 'Complete daily quests. Unlock achievements. Rise through warrior ranks with each victory.'
  }
]

export const LandingFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="bg-card border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="mb-4">
                <feature.icon className="h-12 w-12 text-primary mx-auto" />
              </div>
              <CardTitle className="text-foreground">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
