
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Import slide components
import WelcomeSlide from '@/components/onboarding/WelcomeSlide'
import StatisticsSlide from '@/components/onboarding/StatisticsSlide'
import AgeGroupSlide from '@/components/onboarding/AgeGroupSlide'
import FrequencySlide from '@/components/onboarding/FrequencySlide'
import DurationSlide from '@/components/onboarding/DurationSlide'
import ImpactSlide from '@/components/onboarding/ImpactSlide'
import ThreatLevelSlide from '@/components/onboarding/ThreatLevelSlide'
import BattlePlanSlide from '@/components/onboarding/BattlePlanSlide'

export interface AssessmentData {
  ageGroup: string
  frequency: string
  duration: string
  impact: string[]
  threatLevel: number
  recoveryTimeEstimate: number
}

const BattleAssessmentPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    ageGroup: '',
    frequency: '',
    duration: '',
    impact: [],
    threatLevel: 0,
    recoveryTimeEstimate: 0
  })
  const navigate = useNavigate()

  const slides = [
    { component: 'welcome', title: "Welcome to the Arena" },
    { component: 'statistics', title: "Battle Statistics" },
    { component: 'ageGroup', title: "Recruit Assessment" },
    { component: 'frequency', title: "Habit Frequency" },
    { component: 'duration', title: "Duration Analysis" },
    { component: 'impact', title: "Impact Assessment" },
    { component: 'threatLevel', title: "Challenge Level" },
    { component: 'battlePlan', title: "Your Battle Plan" }
  ]

  const updateAssessmentData = (key: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [key]: value }))
  }

  const calculateThreatLevel = () => {
    let score = 0
    
    // Age factor (balanced approach, no extreme penalties)
    switch (assessmentData.ageGroup) {
      case 'under-18': score += 20; break
      case '18-24': score += 15; break
      case '25-40': score += 10; break
      case 'over-40': score += 8; break
    }
    
    // Frequency factor
    switch (assessmentData.frequency) {
      case 'multiple-daily': score += 40; break
      case 'daily': score += 30; break
      case 'few-times-week': score += 20; break
      case 'weekly': score += 10; break
      case 'monthly': score += 5; break
    }
    
    // Duration factor
    switch (assessmentData.duration) {
      case 'over-5-years': score += 25; break
      case '2-5-years': score += 20; break
      case '6-months-2-years': score += 15; break
      case 'under-6-months': score += 5; break
    }
    
    // Impact factor
    score += assessmentData.impact.length * 3
    
    const threatLevel = Math.min(100, score)
    
    // Recovery time estimate: 1-3 weeks
    let recoveryTimeEstimate
    if (threatLevel >= 80) {
      recoveryTimeEstimate = 21 // 3 weeks
    } else if (threatLevel >= 60) {
      recoveryTimeEstimate = 14 // 2 weeks  
    } else if (threatLevel >= 40) {
      recoveryTimeEstimate = 10 // 1.5 weeks
    } else {
      recoveryTimeEstimate = 7 // 1 week
    }
    
    updateAssessmentData('threatLevel', threatLevel)
    updateAssessmentData('recoveryTimeEstimate', recoveryTimeEstimate)
  }

  const nextSlide = () => {
    if (currentSlide === 5) { // After impact assessment
      calculateThreatLevel()
    }
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const completeAssessment = () => {
    // Store assessment data in localStorage for after signup
    localStorage.setItem('pendingAssessment', JSON.stringify(assessmentData))
    // Redirect to signup page
    navigate('/signup?fromAssessment=true')
  }

  const renderCurrentSlide = () => {
    const slideType = slides[currentSlide].component

    switch (slideType) {
      case 'welcome':
        return <WelcomeSlide onNext={nextSlide} />
      case 'statistics':
        return <StatisticsSlide />
      case 'ageGroup':
        return (
          <AgeGroupSlide
            assessmentData={assessmentData}
            updateAssessmentData={updateAssessmentData}
          />
        )
      case 'frequency':
        return (
          <FrequencySlide
            assessmentData={assessmentData}
            updateAssessmentData={updateAssessmentData}
          />
        )
      case 'duration':
        return (
          <DurationSlide
            assessmentData={assessmentData}
            updateAssessmentData={updateAssessmentData}
          />
        )
      case 'impact':
        return (
          <ImpactSlide
            assessmentData={assessmentData}
            updateAssessmentData={updateAssessmentData}
          />
        )
      case 'threatLevel':
        return (
          <ThreatLevelSlide
            assessmentData={assessmentData}
            updateAssessmentData={updateAssessmentData}
          />
        )
      case 'battlePlan':
        return (
          <BattlePlanSlide
            assessmentData={assessmentData}
            onComplete={completeAssessment}
            isLoading={false}
          />
        )
      default:
        return <WelcomeSlide onNext={nextSlide} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-muted">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <Card className="w-full max-w-4xl bg-card border-border">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-card to-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Step {currentSlide + 1} of {slides.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <div className="min-h-[500px] p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderCurrentSlide()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-border bg-muted/50">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="border-border text-foreground hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentSlide === slides.length - 1 ? (
                <Button
                  onClick={completeAssessment}
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                >
                  Join the Fight
                  <Shield className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextSlide}
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BattleAssessmentPage
