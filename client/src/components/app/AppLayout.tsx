import React, { useState } from 'react'
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import {
  TrendingUp,
  ReceiptText,
  Repeat,
  AlertTriangle,
  PiggyBank,
  Settings,
  Plus,
  UploadCloud,
  Menu,
  X,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { BrandLogo } from '../common/BrandLogo'
import { useFinance } from '../../context/useFinance'
import { AddTransactionModal } from './AddTransactionModal'
import { ImportModal } from './ImportModal'
import type { PeriodFilter } from '../../types/finance'

interface NavItemConfig {
  label: string
  to: string
  icon: React.ElementType
  badge?: string
}

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const {
    period,
    setPeriod,
    openAddTxModal,
    openImportModal,
    resetToDemo,
    recurringSummary,
    anomalySummary,
  } = useFinance()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: NavItemConfig[] = [
    { label: 'Overview', to: '/app', icon: TrendingUp },
    { label: 'Transactions', to: '/app/transactions', icon: ReceiptText },
    {
      label: 'Recurring Payments',
      to: '/app/recurring',
      icon: Repeat,
      badge: `${recurringSummary.candidateCount}`,
    },
    {
      label: 'Investigations',
      to: '/app/investigations',
      icon: AlertTriangle,
      badge: `${anomalySummary.reviewableCount}`,
    },
    { label: 'Savings Lab', to: '/app/savings', icon: PiggyBank },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ]

  // Determine current page title and subtitle from pathname
  const getHeaderMeta = () => {
    switch (location.pathname) {
      case '/app/transactions':
        return {
          title: 'Money Ledger & Transactions',
          subtitle: 'Audit, categorize, and verify all personal monetary inflows and outflows.',
          showPeriod: true,
          showAdd: true,
        }
      case '/app/recurring':
        return {
          title: 'Recurring Payment Detective',
          subtitle: 'Cadence-based pattern engine identifying subscriptions and hidden fees.',
          showPeriod: false,
          showAdd: true,
        }
      case '/app/investigations':
        return {
          title: 'Spending Anomaly Radar',
          subtitle: 'Statistical deviation models exposing irregular spikes and category outliers.',
          showPeriod: false,
          showAdd: false,
        }
      case '/app/savings':
        return {
          title: 'Savings Opportunity Lab',
          subtitle: 'Simulate high-impact behavioral adjustments and calculate compound savings.',
          showPeriod: false,
          showAdd: false,
        }
      case '/app/settings':
        return {
          title: 'Application Preferences',
          subtitle: 'Configure currency formatting, default view windows, and local cache controls.',
          showPeriod: false,
          showAdd: false,
        }
      case '/app':
      default:
        return {
          title: 'Your money, under the lens.',
          subtitle: 'An evidence-led view of where your money goes and what deserves a closer look.',
          showPeriod: true,
          showAdd: true,
        }
    }
  }

  const headerMeta = getHeaderMeta()

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: '30D', label: 'Last 30 Days' },
    { value: '60D', label: 'Last 60 Days' },
    { value: '90D', label: 'Last 90 Days' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'ALL', label: 'All History' },
  ]

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#16201B] font-sans flex flex-col md:flex-row antialiased">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#FFFFFF] border-r border-[#E6E6DF] shrink-0 sticky top-0 h-screen overflow-y-auto justify-between p-5 z-20">
        <div className="space-y-6">
          {/* Logo & Descriptor */}
          <div>
            <Link to="/" className="inline-block group focus:outline-none">
              <BrandLogo size="md" showTagline={false} />
            </Link>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#62726A] mt-1.5 pl-0.5">
              Personal Finance Intelligence
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#788780] px-3 py-1">
              Forensic Navigation
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#153326] text-[#F2F7F4] shadow-2xs font-semibold'
                      : 'text-[#4B5952] hover:bg-[#F5F5F0] hover:text-[#16201B]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#9DB4AC]' : 'text-[#788780]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isActive
                            ? 'bg-[#1B4332] text-[#E3ECE8]'
                            : 'bg-[#E3ECE8] text-[#153326]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Profile, Demo Badge & Public Landing Link */}
        <div className="space-y-3 pt-6 border-t border-[#E6E6DF]">
          {/* Discreet Illustrative Demo Tag */}
          <div className="p-2.5 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC] flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <div className="text-[10px] font-mono text-[#153326] leading-tight">
              <span className="font-semibold block">ILLUSTRATIVE DEMO</span>
              <span className="text-[#52796F]">In-memory forensic dataset</span>
            </div>
          </div>

          {/* Persona Card */}
          <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#153326] text-[#E3ECE8] flex items-center justify-center font-serif text-xs font-medium shrink-0">
                AM
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#16201B] truncate">Alex Morrison</div>
                <div className="text-[10px] text-[#62726A] truncate">Student &amp; SWE Intern</div>
              </div>
            </div>
            <button
              onClick={resetToDemo}
              title="Reset in-memory demo data"
              className="p-1.5 rounded-lg text-[#788780] hover:text-[#16201B] hover:bg-[#E6E6DF] transition-colors shrink-0"
              aria-label="Reset demo dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Return to Public Website */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 text-xs text-[#52796F] hover:text-[#153326] py-1 transition-colors"
          >
            <span>Landing page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* 2. MOBILE TOP NAVBAR */}
      <div className="md:hidden bg-[#FFFFFF] border-b border-[#E6E6DF] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <Link to="/app" className="focus:outline-none">
          <BrandLogo size="sm" showTagline={false} />
        </Link>

        <div className="flex items-center gap-2">
          {headerMeta.showAdd && (
            <button
              onClick={openAddTxModal}
              className="p-1.5 rounded-lg bg-[#153326] text-[#F2F7F4] hover:bg-[#1B4332] text-xs font-medium"
              aria-label="Add transaction"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#35423B] hover:bg-[#F5F5F0] transition-colors"
            aria-label="Toggle navigation drawer"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0C120F]/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-[#FFFFFF] border-r border-[#E6E6DF] p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#62726A] hover:bg-[#F5F5F0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/app'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-[#153326] text-[#F2F7F4] font-semibold'
                          : 'text-[#4B5952] hover:bg-[#F5F5F0]'
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-[#E3ECE8] text-[#153326] text-[10px] font-mono">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E6E6DF] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#62726A]">Alex Morrison</span>
                <button
                  onClick={() => {
                    resetToDemo()
                    setMobileMenuOpen(false)
                  }}
                  className="text-[11px] font-mono text-[#52796F] hover:underline"
                >
                  Reset demo
                </button>
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-xs font-medium text-[#153326] bg-[#F2F7F4] rounded-xl"
              >
                Return to Landing Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content Header */}
        <header className="px-4 sm:px-8 py-5 border-b border-[#E6E6DF] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#52796F] bg-[#E3ECE8] px-2 py-0.5 rounded">
                FORENSIC LEDGER // CASE #4029
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
              <span className="font-mono text-[10px] text-[#2D6A4F]">DEMO DATASET</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#16201B] mt-1 tracking-tight">
              {headerMeta.title}
            </h1>
            <p className="text-xs text-[#62726A] mt-0.5 hidden sm:block">
              {headerMeta.subtitle}
            </p>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Period Selector (where relevant) */}
            {headerMeta.showPeriod && (
              <div className="flex items-center">
                <label htmlFor="period-selector" className="sr-only">
                  Reporting Period
                </label>
                <select
                  id="period-selector"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                  className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] hover:border-[#D4D4CA] focus:outline-none focus:ring-1 focus:ring-[#1B4332] transition-colors"
                >
                  {periodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Import CSV Trigger */}
            <button
              onClick={openImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-[#35423B] hover:bg-[#F5F5F0] hover:border-[#D4D4CA] transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#52796F]" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

            {/* Add Transaction Primary CTA */}
            {headerMeta.showAdd && (
              <button
                onClick={openAddTxModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-[#153326] text-[#F2F7F4] hover:bg-[#1B4332] active:scale-98 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#9DB4AC]" />
                <span>Add Transaction</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <AddTransactionModal />
      <ImportModal />
    </div>
  )
}
