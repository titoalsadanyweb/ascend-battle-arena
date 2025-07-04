
import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssessmentData } from '@/pages/BattleAssessmentPage'

interface DurationSlideProps {
  assessmentData: AssessmentData
  updateAssessmentData: (key: keyof AssessmentData, value: any) => void
}

const DurationSlide: React.FC<DurationSlideProps> = ({ assessmentData, updateAssessmentData }) => {
  const durations = [
    {
      id: 'under-6-months',
      label: 'Under 6 months',
      description: 'Recent pattern development',
      entrenchment: 'Low',
      color: 'border-green-500 bg-green-900/20 hover:bg-green-900/30',
      recovery: 'Quick response expected'
    },
    {
      id: '6-months-2-years',
      label: '6 months - 2 years',
      description: 'Establishing pattern',
      entrenchment: 'Moderate',
      color: 'border-yellow-500 bg-yellow-900/20 hover:bg-yellow-900/30',
      recovery: 'Steady progress likely'
    },
    {
      id: '2-5-years',
      label: '2 - 5 years',
      description: 'Well-established habit',
      entrenchment: 'High',
      color: 'border-orange-500 bg-orange-900/20 hover:bg-orange-900/30',
      recovery: 'Requires persistence'
    },
    {
      id: 'over-5-years',
      label: 'Over 5 years',
      description: 'Deeply ingrained pattern',
      entrenchment: 'Very High',
      color: 'border-red-500 bg-red-900/20 hover:bg-red-900/30',
      recovery: 'Marathon, not sprint'
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
        <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How Long Has This <span className="text-red-400">Battle</span> Been Raging?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Duration affects how deeply the neural pathways are entrenched. This helps us set realistic timelines for your victory.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {durations.map((duration, index) => (
          <motion.div
            key={duration.id}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => updateAssessmentData('duration', duration.id)}
              className={`w-full h-auto p-6 text-left ${duration.color} ${
                assessmentData.duration === duration.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : ''
              } transition-all duration-200`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">{duration.label}</h3>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    duration.entrenchment === 'Low' ? 'bg-green-600 text-white' :
                    duration.entrenchment === 'Moderate' ? 'bg-yellow-600 text-black' :
                    duration.entrenchment === 'High' ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {duration.entrenchment} Entrenchment
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{duration.description}</p>
                <p className="text-primary text-sm font-medium">
                  📈 {duration.recovery}
                </p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-card to-muted rounded-lg p-6 border border-primary/20 max-w-3xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-primary mb-2">🧠 The Science</h4>
            <p className="text-muted-foreground text-sm">
              Neural pathways strengthen over time through repetition. Longer durations mean more rewiring needed, 
              but every brain can change with the right approach.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-2">⚔️ Battle Strategy</h4>
            <p className="text-muted-foreground text-sm">
              Longer battles require different tactics: more patience, stronger support systems, 
              and celebration of smaller victories along the way.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DurationSlide
