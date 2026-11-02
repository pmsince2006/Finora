import React, { useEffect, useState } from 'react'
import { X, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

interface AuthPlaceholderModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  onExploreDemo?: () => void
}

export const AuthPlaceholderModal: React.FC<AuthPlaceholderModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onExploreDemo,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Track prop changes when opened
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setMode(initialMode)
      setSubmitted(false)
      setEmail('')
      setPassword('')
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C120F]/40 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-xl p-6 sm:p-8 text-left transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4332] via-[#52796F] to-[#74968C]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="mb-6">
          <BrandLogo size="sm" showTagline />
          <h2 id="auth-modal-title" className="text-xl font-serif font-medium text-[#16201B] mt-4">
            {mode === 'register' ? 'Begin Your Financial Investigation' : 'Access Your Forensic Ledger'}
          </h2>
          <p className="text-xs text-[#62726A] mt-1">
            {mode === 'register'
              ? 'Private, evidence-backed finance intelligence for students & early career professionals.'
              : 'Log in to inspect recurring payments, anomalies, and active savings plans.'}
          </p>
        </div>

        {/* Phase Notification Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332]">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-[#0E241B]">Phase 01 Public Release Preview</span>
              <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
                Full server-managed JWT authentication & database persistence will be connected in Phase 02. You can interact with the live product preview and scenario calculator below right now.
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E3ECE8] text-[#1B4332] flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-medium text-[#16201B]">Welcome to SpendSleuth Preview</h3>
            <p className="text-xs text-[#62726A] mt-1 mb-5">
              Your preview request is noted. Click below to inspect the interactive forensic dashboard immediately.
            </p>
            <button
              onClick={() => {
                onClose()
                if (onExploreDemo) onExploreDemo()
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors shadow-xs"
            >
              <span>Explore Interactive Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#35423B] mb-1">
                University or Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#35423B] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                />
                <Lock className="w-3.5 h-3.5 text-[#A2B0A9] absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors shadow-xs"
            >
              <span>{mode === 'register' ? 'Create Demo Account' : 'Sign In to Preview'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                className="text-xs text-[#52796F] hover:text-[#1B4332] transition-colors"
              >
                {mode === 'register'
                  ? 'Already have credentials? Sign in'
                  : "Don't have an account? Start investigating"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-[#E6E6DF] flex items-center justify-between text-[11px] text-[#788780]">
          <span>Zero third-party bank linking</span>
          <span>Local CSV privacy first</span>
        </div>
      </div>
    </div>
  )
}
