
import React from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssessmentData } from '@/pages/BattleAssessmentPage'

interface AgeGroupSlideProps {
  assessmentData: AssessmentData
  updateAssessmentData: (key: keyof AssessmentData, value: any) => void
}

const AgeGroupSlide: React.FC<AgeGroupSlideProps> = ({ assessmentData, updateAssessmentData }) => {
  const ageGroups = [
    {
      id: 'under-18',
      label: 'Under 18',
      description: 'Young warrior in training'
    },
    {
      id: '18-24',
      label: '18-24',
      description: 'Early career warrior'
    },
    {
      id: '25-40',
      label: '25-40',
      description: 'Experienced fighter'
    },
    {
      id: 'over-40',
      label: 'Over 40',
      description: 'Veteran warrior'
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
        <User className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          What's Your <span className="text-primary">Age Group</span>?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Different age groups face unique challenges. This helps us tailor your battle strategy and set realistic expectations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {ageGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => updateAssessmentData('ageGroup', group.id)}
              className={`w-full h-auto p-6 text-left border-border bg-card hover:bg-accent/50 ${
                assessmentData.ageGroup === group.id 
                  ? 'ring-2 ring-primary border-primary bg-primary/10' 
                  : ''
              } transition-all duration-200`}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">{group.label}</h3>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-4 max-w-2xl mx-auto"
      >
        <p className="text-muted-foreground text-sm text-center">
          <span className="text-primary font-medium">⚡ Battle Intel:</span> Age provides valuable context for 
          personalizing your journey. Every warrior's path is unique, and we'll tailor your experience accordingly.
        </p>
      </motion.div>
    </div>
  )
}

export default AgeGroupSlide
