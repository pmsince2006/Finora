import React from 'react'
import { BrandLogo } from './BrandLogo'
import { Shield } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FBFBFA] border-t border-[#E6E6DF] py-14 text-xs text-[#62726A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E6E6DF]">
          {/* Brand & Manifesto Column */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo size="md" showTagline />
            <p className="text-xs text-[#4B5952] max-w-sm leading-relaxed">
              SpendSleuth is a personal finance intelligence platform created for students and young professionals. Turning transaction history into evidence-backed savings opportunities.
            </p>
            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E6E6DF] inline-flex items-center gap-2.5 text-[11px] text-[#35423B]">
              <Shield className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>Engineered without direct bank credential scraping or selling of user data.</span>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#16201B] font-semibold">
              Forensic Engines
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-[#16201B] transition-colors">
                  Money Ledger
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#16201B] transition-colors">
                  Recurring Payment Detective
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#16201B] transition-colors">
                  Spending Anomaly Radar
                </a>
              </li>
              <li>
                <a href="#savings-calculator" className="hover:text-[#16201B] transition-colors">
                  Savings Opportunity Lab
                </a>
              </li>
            </ul>
          </div>

          {/* Platform & Data Security Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#16201B] font-semibold">
              Data Principles
            </div>
            <p className="text-xs text-[#62726A] leading-relaxed">
              All transactions remain private to your local session or isolated user database. Uploaded CSVs are parsed locally with SHA-256 deduplication.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#788780] space-y-1">
              <div>Version 1.0.0-phase01</div>
              <div>Stack: React 19 • Vite • TypeScript • Tailwind CSS</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#788780]">
          <div>
            © 2026 SpendSleuth. Personal Finance Intelligence. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-[#16201B] transition-colors">
              How It Works
            </a>
            <a href="#preview" className="hover:text-[#16201B] transition-colors">
              Product Preview
            </a>
            <a href="#savings-calculator" className="hover:text-[#16201B] transition-colors">
              Savings Sandbox
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
