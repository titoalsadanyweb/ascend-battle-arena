
import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AssessmentData } from '@/pages/BattleAssessmentPage'

interface ImpactSlideProps {
  assessmentData: AssessmentData
  updateAssessmentData: (key: keyof AssessmentData, value: any) => void
}

const ImpactSlide: React.FC<ImpactSlideProps> = ({ assessmentData, updateAssessmentData }) => {
  const impactAreas = [
    {
      id: 'relationships',
      label: 'Relationships & Social Life',
      description: 'Strain on partnerships, friendships, family connections',
      severity: 'High Impact'
    },
    {
      id: 'work-productivity',
      label: 'Work & Productivity',
      description: 'Decreased focus, missed opportunities, career stagnation',
      severity: 'Medium Impact'
    },
    {
      id: 'mental-health',
      label: 'Mental Health',
      description: 'Anxiety, depression, shame, low self-esteem',
      severity: 'High Impact'
    },
    {
      id: 'physical-health',
      label: 'Physical Health',
      description: 'Sleep issues, fatigue, neglect of exercise or nutrition',
      severity: 'Medium Impact'
    },
    {
      id: 'financial',
      label: 'Financial',
      description: 'Money spent on content, subscriptions, or related expenses',
      severity: 'Low Impact'
    },
    {
      id: 'spiritual-values',
      label: 'Spiritual/Values',
      description: 'Conflict with personal beliefs or moral values',
      severity: 'High Impact'
    },
    {
      id: 'time-management',
      label: 'Time Management',
      description: 'Hours lost, procrastination, missed commitments',
      severity: 'Medium Impact'
    },
    {
      id: 'self-worth',
      label: 'Self-Worth & Identity',
      description: 'Feeling of loss of control, identity crisis, shame spiral',
      severity: 'High Impact'
    }
  ]

  const toggleImpact = (impactId: string) => {
    const currentImpacts = assessmentData.impact || []
    const newImpacts = currentImpacts.includes(impactId)
      ? currentImpacts.filter(id => id !== impactId)
      : [...currentImpacts, impactId]
    
    updateAssessmentData('impact', newImpacts)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <AlertTriangle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Which Areas Are Under <span className="text-red-400">Attack</span>?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select all areas where this habit has impacted your life. This helps us prioritize your recovery strategy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {impactAreas.map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => toggleImpact(area.id)}
              className={`w-full h-auto p-4 text-left border-border bg-card hover:bg-accent/50 ${
                assessmentData.impact?.includes(area.id) 
                  ? 'ring-2 ring-primary border-primary bg-primary/10' 
                  : ''
              } transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={assessmentData.impact?.includes(area.id) || false}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground text-sm">{area.label}</h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      area.severity === 'High Impact' ? 'bg-red-600 text-white' :
                      area.severity === 'Medium Impact' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-black'
                    }`}>
                      {area.severity}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">{area.description}</p>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <div className="bg-card border border-border rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-muted-foreground text-sm">
            <span className="text-primary font-medium">Selected: {assessmentData.impact?.length || 0}/8 areas</span>
            <br />
            Don't worry if it feels overwhelming. Every checked box is an area where victory will bring healing.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ImpactSlide
