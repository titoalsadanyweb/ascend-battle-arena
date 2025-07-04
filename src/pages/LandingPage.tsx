
import React from 'react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingSocialProof } from '@/components/landing/LandingSocialProof'
import { LandingFinalCTA } from '@/components/landing/LandingFinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <LandingHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingSocialProof />
        <LandingFinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}

export default LandingPage
