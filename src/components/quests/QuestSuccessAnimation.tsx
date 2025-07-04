
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, Coins } from 'lucide-react'

interface QuestSuccessAnimationProps {
  tokensEarned: number
  questType: string
  onClose: () => void
}

const QuestSuccessAnimation: React.FC<QuestSuccessAnimationProps> = ({
  tokensEarned,
  questType,
  onClose
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 max-w-sm mx-4">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-4"
          >
            <div className="relative">
              <Trophy className="h-16 w-16 text-amber-500 mx-auto" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-6 w-6 text-amber-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-amber-800 mb-2">
              Quest Complete! 🎉
            </h3>
            <p className="text-sm text-amber-700 mb-4 capitalize">
              {questType} quest successfully completed
            </p>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="flex items-center justify-center gap-2"
            >
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-3 py-1">
                <Coins className="h-4 w-4 mr-1" />
                +{tokensEarned} Valor Shards
              </Badge>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-amber-600 mt-4"
          >
            Tap anywhere to continue
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default QuestSuccessAnimation
