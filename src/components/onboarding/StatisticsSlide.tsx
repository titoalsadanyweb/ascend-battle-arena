
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Clock, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const StatisticsSlide: React.FC = () => {
  const stats = [
    {
      icon: TrendingUp,
      title: "Recovery Success Rate",
      percentage: 73,
      description: "Users who stay clean for 90+ days with our support system",
      color: "text-green-400"
    },
    {
      icon: Clock,
      title: "Average Recovery Time",
      percentage: 45,
      description: "Days faster recovery compared to going alone",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Community Support",
      percentage: 89,
      description: "Users report feeling less isolated with battle allies",
      color: "text-secondary"
    },
    {
      icon: Trophy,
      title: "Long-term Success",
      percentage: 84,
      description: "Users maintain their progress after 6 months",
      color: "text-primary"
    }
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-foreground mb-4">
          The Power of <span className="text-primary">Community & Structure</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our warriors don't fight alone. See how our battle-tested approach accelerates recovery compared to traditional methods.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{stat.title}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl font-bold text-primary">
                        {stat.percentage}%
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gradient-to-r from-card to-muted rounded-lg p-6 border border-primary/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Join 15,000+ Warriors</h3>
            <p className="text-muted-foreground">
              Our community has achieved over <span className="text-primary font-semibold">2.3 million</span> clean days collectively.
              Your victory contributes to something bigger than yourself.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatisticsSlide
