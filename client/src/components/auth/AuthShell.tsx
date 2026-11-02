import React from 'react'
import { AuthBackground } from './AuthBackground'

interface AuthShellProps {
  children: React.ReactNode
  maxWidth?: string
}

/**
 * Full-viewport non-scrollable container shell for Finora authentication pages.
 * Hosts the animated MicroSlats canvas background and centers the interactive card.
 */
export const AuthShell: React.FC<AuthShellProps> = ({
  children,
  maxWidth = 'max-w-[460px]',
}) => {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black text-[#F2F7F4] font-sans flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Animated MicroSlats Full-Viewport Background */}
      <AuthBackground />

      {/* Centered Glassmorphic Authentication Card */}
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-2xl sm:rounded-3xl bg-[#09130E]/88 backdrop-blur-2xl border border-[#1C3628] shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_35px_rgba(16,185,129,0.06)] p-5 sm:p-7 md:p-8 flex flex-col select-text`}
      >
        {children}
      </div>
    </div>
  )
}
