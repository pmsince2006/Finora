import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  Repeat,
  PiggyBank,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { BrandLogo } from '../common/BrandLogo'
import { formatCurrency } from '../../lib/formatCurrency'

interface DashboardPreviewProps {
  onInteract?: (featureName: string) => void
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onInteract }) => {
  const [activeTab, setActiveTab] = useState<'30D' | '60D' | '90D'>('30D')
  const [selectedRow, setSelectedRow] = useState<string | null>('t2')

  // Sample illustrative INR transactions (matching demo profile)
  const sampleTransactions = [
    {
      id: 't1',
      merchant: 'Advanced Robotics Lab & Kit',
      category: 'Education & Textbooks',
      date: 'Apr 24, 2026',
      amount: 9800,
      type: 'expense' as const,
      status: 'anomaly' as const,
      evidence: '4.1x above your usual education average',
    },
    {
      id: 't2',
      merchant: 'Spotify Premium Family',
      category: 'Digital Services',
      date: 'Apr 21, 2026',
      amount: 199,
      type: 'expense' as const,
      status: 'recurring' as const,
      evidence: 'Repeats every month (verified bill)',
    },
    {
      id: 't3',
      merchant: 'Nature Basket Supermarket',
      category: 'Groceries & Staples',
      date: 'Apr 19, 2026',
      amount: 2840,
      type: 'expense' as const,
      status: 'normal' as const,
      evidence: 'Within typical weekly grocery budget',
    },
    {
      id: 't4',
      merchant: 'Tech Internship Monthly Stipend',
      category: 'Salary & Stipend',
      date: 'Apr 15, 2026',
      amount: 45000,
      type: 'income' as const,
      status: 'verified' as const,
      evidence: 'Monthly recurring credit',
    },
    {
      id: 't5',
      merchant: 'Third Wave Coffee Roasters',
      category: 'Food & Dining',
      date: 'Apr 12, 2026',
      amount: 380,
      type: 'expense' as const,
      status: 'normal' as const,
      evidence: 'Typical coffee run',
    },
  ]

  // Monthly spending distribution in INR
  const monthlyData = [
    { month: 'Nov', spend: 46200, baseline: 47500 },
    { month: 'Dec', spend: 58400, baseline: 48000 },
    { month: 'Jan', spend: 43100, baseline: 47500 },
    { month: 'Feb', spend: 42000, baseline: 46000 },
    { month: 'Mar', spend: 51200, baseline: 47500 },
    { month: 'Apr', spend: 48650, baseline: 47500 },
  ]

  return (
    <section id="preview" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24">
      {/* Editorial Frame Label */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-[#E6E6DF] mb-6 text-xs text-[#62726A]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#153326] font-semibold tracking-wider">
            [SPENDSLEUTH DEMO PREVIEW]
          </span>
          <span className="hidden sm:inline text-[#D4D4CA]">|</span>
          <span className="hidden sm:inline">Profile: Alex M. (Student &amp; SWE Intern)</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2D6A4F]" />
          <span className="font-mono text-[11px] text-[#2D6A4F]">ILLUSTRATIVE DEMO DATA (INR ₹)</span>
        </div>
      </div>

      {/* Main Layered Window Container */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-xl overflow-hidden"
      >
        {/* Window Chrome Header (Steep Reference: 3 clean window dots & breadcrumbs) */}
        <div className="px-5 py-3.5 bg-[#FBFBFA] border-b border-[#E6E6DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E6E6DF] border border-[#D4D4CA]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E6E6DF] border border-[#D4D4CA]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E6E6DF] border border-[#D4D4CA]" />
            <span className="ml-3 text-xs font-mono text-[#788780] hidden sm:inline">
              spendsleuth.app/overview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC]">
              SAMPLE FINANCIAL OVERVIEW
            </span>
          </div>
        </div>

        {/* Dashboard Content Grid (Finora Reference: Sidebar + Analytics + Main Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Sub-Sidebar (Finora-inspired clean navigation rail) */}
          <div className="lg:col-span-3 border-r border-[#E6E6DF] bg-[#FDFDFD] p-5 hidden lg:flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <BrandLogo size="sm" showTagline />
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#788780] px-3 py-1">
                  Features
                </div>

                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#153326] text-[#F2F7F4] shadow-2xs">
                  <span className="flex items-center gap-2.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#9DB4AC]" />
                    <span>Overview</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#74968C]" />
                </button>

                <button
                  onClick={() => onInteract?.('Money Ledger')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-[#788780]" />
                    <span>Money Ledger</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#788780]">142 items</span>
                </button>

                <button
                  onClick={() => onInteract?.('Recurring Detective')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Repeat className="w-3.5 h-3.5 text-[#52796F]" />
                    <span>Recurring Detective</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#E3ECE8] text-[#153326] text-[10px] font-mono">
                    6 active
                  </span>
                </button>

                <button
                  onClick={() => onInteract?.('Anomaly Radar')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C97A2B]" />
                    <span>Anomaly Radar</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#FCF4EB] text-[#C97A2B] text-[10px] font-mono font-semibold">
                    1 higher
                  </span>
                </button>

                <button
                  onClick={() => onInteract?.('Savings Lab')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <PiggyBank className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Savings Lab</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#2D6A4F] font-semibold">+₹5,800/mo</span>
                </button>
              </div>
            </div>

            {/* Persona Card */}
            <div className="p-3.5 rounded-xl bg-[#F5F5F0] border border-[#E6E6DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#153326] text-[#E3ECE8] flex items-center justify-center font-serif text-sm">
                  AM
                </div>
                <div>
                  <div className="text-xs font-medium text-[#16201B]">Alex Morrison</div>
                  <div className="text-[10px] text-[#62726A]">Student &amp; SWE Intern</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-9 p-5 sm:p-7 space-y-6 bg-white">
            {/* Top Stat Boxes (Finora hierarchy: Total / In / Out / Savings) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="text-[11px] font-mono text-[#788780] uppercase tracking-wide">
                  Monthly Expenses
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#16201B] mt-1">
                  {formatCurrency(48650)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#2D6A4F] mt-1 font-medium">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Typical monthly pace</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="text-[11px] font-mono text-[#788780] uppercase tracking-wide">
                  Subscriptions
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#16201B] mt-1">
                  {formatCurrency(2450)}
                  <span className="text-[10px] font-mono text-[#788780] font-normal ml-1">/mo</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#52796F] mt-1 font-medium">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>6 active services</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCF4EB] border border-[#F3D7BD]">
                <div className="text-[11px] font-mono text-[#C97A2B] uppercase tracking-wide flex items-center justify-between">
                  <span>Higher Spending</span>
                  <span className="w-2 h-2 rounded-full bg-[#C97A2B]" />
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#7A400B] mt-1">
                  1 <span className="text-xs font-sans font-normal text-[#7A400B]">payment</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#C97A2B] mt-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{formatCurrency(7400)} above average</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC]">
                <div className="text-[11px] font-mono text-[#153326] uppercase tracking-wide">
                  Potential Savings
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#153326] mt-1">
                  +{formatCurrency(5800)}
                  <span className="text-xs font-mono font-normal text-[#2D6A4F]">/mo</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#2D6A4F] mt-1 font-medium">
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>2 simple adjustments</span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Chart (Finora Inspiration: Spending Trend) */}
            <div className="p-5 rounded-xl border border-[#E6E6DF] bg-[#FDFDFD]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6E6DF] gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#16201B]">Monthly Spending Trends</h3>
                  <p className="text-xs text-[#62726A]">
                    Compare each month&apos;s spending against your typical monthly average
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F5F5F0] p-1 rounded-lg self-start sm:self-auto">
                  {(['30D', '60D', '90D'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        activeTab === tab
                          ? 'bg-white text-[#153326] font-semibold shadow-2xs'
                          : 'text-[#62726A] hover:text-[#16201B]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* SVG Trend Graph with Tooltip Indicator */}
              <div className="pt-5 pb-2">
                <div className="relative h-36 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6">
                  {monthlyData.map((d) => {
                    const heightPercent = Math.round((d.spend / 65000) * 100)
                    const isApril = d.month === 'Apr'

                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                        {/* Tooltip on April / active month */}
                        {isApril && (
                          <div className="absolute -top-3 left-3/4 sm:left-[80%] -translate-x-1/2 bg-[#153326] text-[#F2F7F4] text-[10px] font-mono px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap z-20">
                            <span className="block text-[#9DB4AC]">Apr 2026 Spending</span>
                            <span className="font-bold">{formatCurrency(48650)}</span> (Usual {formatCurrency(47500)})
                          </div>
                        )}

                        {/* Bar Visual */}
                        <div className="w-full max-w-[40px] relative flex flex-col justify-end h-full">
                          {/* Baseline threshold marker */}
                          <div
                            className="absolute w-full border-t border-dashed border-[#788780]/40 z-10"
                            style={{ bottom: `${(d.baseline / 65000) * 100}%` }}
                          />
                          {/* Main Bar */}
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              isApril
                                ? 'bg-gradient-to-t from-[#153326] to-[#2D6A4F]'
                                : 'bg-[#E3ECE8] group-hover:bg-[#C2D3CC]'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span
                          className={`mt-2 text-[11px] font-mono ${
                            isApril ? 'font-bold text-[#153326]' : 'text-[#788780]'
                          }`}
                        >
                          {d.month}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Transaction List (Canonical Ledger preview) */}
            <div className="rounded-xl border border-[#E6E6DF] overflow-hidden">
              <div className="px-5 py-3.5 bg-[#FBFBFA] border-b border-[#E6E6DF] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#16201B]">Recent Transactions</h3>
                  <span className="text-[11px] text-[#788780]">
                    See individual purchases and why they stand out
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#52796F] bg-[#E3ECE8] px-2 py-0.5 rounded">
                  CSV IMPORT SAMPLE
                </span>
              </div>

              <div className="divide-y divide-[#E6E6DF] text-xs">
                {sampleTransactions.map((tx) => {
                  const isSelected = selectedRow === tx.id
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedRow(tx.id)}
                      className={`p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#F2F7F4]/60' : 'hover:bg-[#FDFDFD]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.status === 'anomaly'
                              ? 'bg-[#FCF4EB] text-[#C97A2B]'
                              : tx.status === 'recurring'
                              ? 'bg-[#E3ECE8] text-[#153326]'
                              : tx.type === 'income'
                              ? 'bg-[#E3ECE8] text-[#2D6A4F]'
                              : 'bg-[#F5F5F0] text-[#788780]'
                          }`}
                        >
                          {tx.status === 'anomaly' ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : tx.status === 'recurring' ? (
                            <Repeat className="w-3.5 h-3.5" />
                          ) : tx.type === 'income' ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div>
                          <div className="font-medium text-[#16201B] flex items-center gap-2">
                            <span>{tx.merchant}</span>
                            {tx.status === 'anomaly' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FCF4EB] text-[#C97A2B] font-semibold border border-[#F3D7BD]">
                                HIGHER THAN USUAL
                              </span>
                            )}
                            {tx.status === 'recurring' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC]">
                                MONTHLY REPEAT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#788780] mt-0.5">
                            {tx.category} • <span className="font-mono text-[#52796F]">{tx.evidence}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-right pl-10 sm:pl-0">
                        <span className="text-[11px] font-mono text-[#788780]">{tx.date}</span>
                        <span
                          className={`font-mono text-xs font-semibold ${
                            tx.type === 'income' ? 'text-[#2D6A4F]' : 'text-[#16201B]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Annotation Pill (Echoing the Steep reference cursor card) */}
        <div className="hidden lg:flex absolute bottom-8 right-8 z-30 max-w-sm p-4 rounded-xl bg-[#FFFFFF] border border-[#153326]/20 shadow-xl items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#153326] text-[#E3ECE8] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
            SL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#16201B]">SpendSleuth Guide</span>
              <span className="text-[10px] font-mono text-[#788780]">Apr 28</span>
            </div>
            <p className="text-xs text-[#4B5952] mt-0.5 leading-relaxed">
              Found 1 recurring subscription for <span className="font-medium text-[#16201B]">Spotify Premium (₹199/mo)</span> and flagged 1 college project kit that was higher than usual.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
