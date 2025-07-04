
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const AchievementsSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-card border-ascend-warning/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ascend-warning">
            <Trophy className="h-6 w-6" />
            HALL OF ACHIEVEMENTS
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Celebrate your hard-earned victories and milestones in the arena.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Shield className="h-16 w-16 text-ascend-primary/50 mx-auto shield-glow" />
            <p className="text-muted-foreground font-medium">Your achievements will be displayed here as you progress in your journey.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AchievementsSection
