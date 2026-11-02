import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Hero } from '../components/landing/Hero'
import { DashboardPreview } from '../components/landing/DashboardPreview'
import { HowItWorks } from '../components/landing/HowItWorks'
import { FeatureShowcase } from '../components/landing/FeatureShowcase'
import { InteractiveScenarioTester } from '../components/landing/InteractiveScenarioTester'
import { ClosingCTA } from '../components/landing/ClosingCTA'
import { Footer } from '../components/common/Footer'
import { AuthPlaceholderModal } from '../components/common/AuthPlaceholderModal'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register')

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const handleCloseAuth = () => {
    setAuthModalOpen(false)
  }

  const handleJumpToPreview = () => {
    const el = document.getElementById('preview')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNavigateToApp = () => {
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#16201B] font-sans flex flex-col selection:bg-[#153326] selection:text-[#F2F7F4]">
      {/* Editorial Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onJumpToPreview={handleJumpToPreview}
        onOpenApp={handleNavigateToApp}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with Editorial Headline */}
        <Hero
          onStartInvestigating={() => handleOpenAuth('register')}
          onExploreProduct={handleNavigateToApp}
        />

        {/* Centerpiece Layered Dashboard Preview */}
        <DashboardPreview
          onInteract={(feature) => {
            if (feature === 'Money Ledger') navigate('/app/transactions')
            else if (feature === 'Recurring Detective') navigate('/app/recurring')
            else if (feature === 'Anomaly Radar') navigate('/app/investigations')
            else if (feature === 'Savings Lab') navigate('/app/savings')
            else {
              const el = document.getElementById('features')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        />

        {/* 3-Step Forensic Workflow */}
        <HowItWorks />

        {/* Four Dedicated Feature Showcases */}
        <FeatureShowcase />

        {/* Live Interactive Savings Opportunity Sandbox */}
        <InteractiveScenarioTester
          onCommitPlan={() => navigate('/app/savings')}
        />

        {/* Closing Action Banner */}
        <ClosingCTA
          onStartInvestigating={() => handleOpenAuth('register')}
          onExploreDemo={handleNavigateToApp}
        />
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Auth & Preview Gateway Modal */}
      <AuthPlaceholderModal
        isOpen={authModalOpen}
        onClose={handleCloseAuth}
        initialMode={authModalMode}
        onExploreDemo={handleNavigateToApp}
      />
    </div>
  )
}
