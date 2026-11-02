import React, { useState, useEffect } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void
  onJumpToPreview: () => void
  onOpenApp?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onJumpToPreview, onOpenApp }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Product Preview', href: '#preview', action: onJumpToPreview },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Savings Lab', href: '#savings-calculator' },
  ]

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, action?: () => void) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (action) {
      action()
    } else {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E6E6DF] py-3.5 shadow-xs'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark & Icon */}
          <a href="#" className="flex items-center gap-2 group">
            <BrandLogo size="md" showTagline />
          </a>

          {/* Center Navigation Links (Steep-inspired clean editorial spacing) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href, link.action)}
                className="text-xs font-medium text-[#4B5952] hover:text-[#0E241B] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#1B4332] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {onOpenApp && (
              <button
                onClick={onOpenApp}
                className="text-xs font-mono font-medium text-[#153326] bg-[#E3ECE8] hover:bg-[#D4D4CA] px-3.5 py-2 rounded-xl transition-colors border border-[#C2D3CC]"
              >
                Launch App
              </button>
            )}
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-medium text-[#35423B] hover:text-[#0E241B] px-3.5 py-2 rounded-xl transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] active:scale-98 transition-all shadow-xs"
            >
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#35423B] hover:bg-[#F5F5F0] transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-[#E6E6DF] mt-3 space-y-2 bg-[#FBFBFA] rounded-2xl p-4 shadow-lg border">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href, link.action)}
                className="block px-3 py-2 text-sm font-medium text-[#35423B] hover:text-[#0E241B] hover:bg-[#F5F5F0] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[#E6E6DF] flex flex-col gap-2">
              {onOpenApp && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onOpenApp()
                  }}
                  className="w-full text-center px-4 py-2.5 text-xs font-mono font-medium text-[#153326] bg-[#E3ECE8] rounded-xl hover:bg-[#D4D4CA] transition-colors border border-[#C2D3CC]"
                >
                  Launch Interactive App
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenAuth('login')
                }}
                className="w-full text-center px-4 py-2.5 text-xs font-medium text-[#35423B] bg-[#F5F5F0] rounded-xl hover:bg-[#E6E6DF] transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenAuth('register')
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors"
              >
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
