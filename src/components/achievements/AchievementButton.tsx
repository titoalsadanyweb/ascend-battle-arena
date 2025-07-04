
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import { useAchievements } from '@/lib/hooks/useAchievements'
import AchievementsModal from './AchievementsModal'

const AchievementButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const { achievements, userAchievements } = useAchievements()

  const unlockedCount = userAchievements.length
  const totalCount = achievements.length

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="relative"
      >
        <Trophy className="h-4 w-4 mr-2" />
        Achievements
        <Badge variant="secondary" className="ml-2">
          {unlockedCount}/{totalCount}
        </Badge>
      </Button>

      <AchievementsModal
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  )
}

export default AchievementButton
