
import React from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssessmentData } from '@/pages/BattleAssessmentPage'

interface FrequencySlideProps {
  assessmentData: AssessmentData
  updateAssessmentData: (key: keyof AssessmentData, value: any) => void
}

const FrequencySlide: React.FC<FrequencySlideProps> = ({ assessmentData, updateAssessmentData }) => {
  const frequencies = [
    {
      id: 'multiple-daily',
      label: 'Multiple times daily',
      description: 'Several times throughout the day',
      severity: 'Critical',
      color: 'border-red-600 bg-red-900/30 hover:bg-red-900/40',
      icon: '🔥'
    },
    {
      id: 'daily',
      label: 'Once daily',
      description: 'Usually around the same time each day',
      severity: 'High',
      color: 'border-orange-500 bg-orange-900/20 hover:bg-orange-900/30',
      icon: '⚡'
    },
    {
      id: 'few-times-week',
      label: 'Few times per week',
      description: '3-6 times per week',
      severity: 'Moderate',
      color: 'border-yellow-500 bg-yellow-900/20 hover:bg-yellow-900/30',
      icon: '⚠️'
    },
    {
      id: 'weekly',
      label: 'About weekly',
      description: 'Once or twice per week',
      severity: 'Mild',
      color: 'border-blue-500 bg-blue-900/20 hover:bg-blue-900/30',
      icon: '📊'
    },
    {
      id: 'monthly',
      label: 'Monthly or less',
      description: 'Occasional episodes',
      severity: 'Low',
      color: 'border-green-500 bg-green-900/20 hover:bg-green-900/30',
      icon: '✅'
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
        <Activity className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How Often Does This <span className="text-red-400">Enemy Attack</span>?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Understanding frequency helps us gauge the intensity of your battle and design appropriate countermeasures.
        </p>
      </motion.div>

      <div className="space-y-3 max-w-3xl mx-auto">
        {frequencies.map((freq, index) => (
          <motion.div
            key={freq.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => updateAssessmentData('frequency', freq.id)}
              className={`w-full h-auto p-6 text-left ${freq.color} ${
                assessmentData.frequency === freq.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : ''
              } transition-all duration-200`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{freq.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{freq.label}</h3>
                    <p className="text-slate-300 text-sm">{freq.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  freq.severity === 'Critical' ? 'bg-red-600 text-white' :
                  freq.severity === 'High' ? 'bg-orange-600 text-white' :
                  freq.severity === 'Moderate' ? 'bg-yellow-600 text-black' :
                  freq.severity === 'Mild' ? 'bg-blue-600 text-white' :
                  'bg-green-600 text-white'
                }`}>
                  {freq.severity}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-card border border-border rounded-lg p-4 max-w-2xl mx-auto"
      >
        <p className="text-muted-foreground text-sm text-center">
          <span className="text-primary font-medium">🛡️ Remember:</span> No judgment here, warrior. 
          Honest assessment leads to effective strategy. Every great victory starts with facing the truth.
        </p>
      </motion.div>
    </div>
  )
}

export default FrequencySlide
