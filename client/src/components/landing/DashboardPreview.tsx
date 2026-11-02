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

interface DashboardPreviewProps {
  onInteract?: (featureName: string) => void
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onInteract }) => {
  const [activeTab, setActiveTab] = useState<'30D' | '60D' | '90D'>('30D')
  const [selectedRow, setSelectedRow] = useState<string | null>('t2')

  // Sample illustrative transactions
  const sampleTransactions = [
    {
      id: 't1',
      merchant: 'University Campus Bookstore',
      category: 'Education & Textbooks',
      date: 'Apr 24, 2026',
      amountInCents: 31240, // $312.40
      type: 'expense' as const,
      status: 'anomaly' as const,
      evidence: '4.2x above category moving baseline',
    },
    {
      id: 't2',
      merchant: 'Spotify Family Subscription',
      category: 'Digital Services',
      date: 'Apr 21, 2026',
      amountInCents: 1699, // $16.99
      type: 'expense' as const,
      status: 'recurring' as const,
      evidence: 'Cadence: 30-day regular cycle (99% confidence)',
    },
    {
      id: 't3',
      merchant: 'Trader Joe’s Market',
      category: 'Groceries & Staples',
      date: 'Apr 19, 2026',
      amountInCents: 7845, // $78.45
      type: 'expense' as const,
      status: 'normal' as const,
      evidence: 'Within expected weekly baseline',
    },
    {
      id: 't4',
      merchant: 'Tech Internship Monthly Stipend',
      category: 'Primary Income',
      date: 'Apr 15, 2026',
      amountInCents: 320000, // $3,200.00
      type: 'income' as const,
      status: 'verified' as const,
      evidence: 'Bi-monthly recurring credit',
    },
    {
      id: 't5',
      merchant: 'Blue Bottle Coffee Roasters',
      category: 'Food & Dining',
      date: 'Apr 12, 2026',
      amountInCents: 1850, // $18.50
      type: 'expense' as const,
      status: 'normal' as const,
      evidence: 'Discretionary frequency normal',
    },
  ]

  // Monthly spending distribution bars (SVG graph coordinates)
  const monthlyData = [
    { month: 'Nov', spend: 1840, baseline: 1900 },
    { month: 'Dec', spend: 2310, baseline: 1950 },
    { month: 'Jan', spend: 1720, baseline: 1900 },
    { month: 'Feb', spend: 1680, baseline: 1850 },
    { month: 'Mar', spend: 2040, baseline: 1900 },
    { month: 'Apr', spend: 1945, baseline: 1900 },
  ]

  return (
    <section id="preview" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24">
      {/* Editorial Frame Label */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-[#E6E6DF] mb-6 text-xs text-[#62726A]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#153326] font-semibold tracking-wider">
            [SPENDSLEUTH LAB PREVIEW // CASE #4029]
          </span>
          <span className="hidden sm:inline text-[#D4D4CA]">|</span>
          <span className="hidden sm:inline">Subject: Alex M. (Early Career Engineer)</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2D6A4F]" />
          <span className="font-mono text-[11px] text-[#2D6A4F]">ILLUSTRATIVE FINANCIAL DATASET</span>
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
              spendsleuth.app/forensics/ledger
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC]">
              4 INVESTIGATIVE ENGINES ACTIVE
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

              {/* Forensic Navigation Items */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#788780] px-3 py-1">
                  Investigation
                </div>

                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#153326] text-[#F2F7F4] shadow-2xs">
                  <span className="flex items-center gap-2.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#9DB4AC]" />
                    <span>Intelligence Hub</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#74968C]" />
                </button>

                <button
                  onClick={() => onInteract?.('Money Ledger')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-[#788780]" />
                    <span>Money Ledger</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#788780]">142 tx</span>
                </button>

                <button
                  onClick={() => onInteract?.('Recurring Detective')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors"
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
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C97A2B]" />
                    <span>Anomaly Radar</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#FCF4EB] text-[#C97A2B] text-[10px] font-mono font-semibold">
                    1 flagged
                  </span>
                </button>

                <button
                  onClick={() => onInteract?.('Savings Lab')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4B5952] hover:bg-[#F5F5F0] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <PiggyBank className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Savings Lab</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#2D6A4F] font-semibold">+$245/mo</span>
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
                  Monitored Outflow
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#16201B] mt-1">
                  $1,945<span className="text-xs font-mono font-normal text-[#788780]">.84</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#2D6A4F] mt-1 font-medium">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>3.2% vs 60d avg</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="text-[11px] font-mono text-[#788780] uppercase tracking-wide">
                  Recurring Commitments
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#16201B] mt-1">
                  $142<span className="text-xs font-mono font-normal text-[#788780]">.50</span>
                  <span className="text-[10px] font-mono text-[#788780] font-normal ml-1">/mo</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#52796F] mt-1 font-medium">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>6 verified services</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCF4EB] border border-[#F3D7BD]">
                <div className="text-[11px] font-mono text-[#C97A2B] uppercase tracking-wide flex items-center justify-between">
                  <span>Detected Spikes</span>
                  <span className="w-2 h-2 rounded-full bg-[#C97A2B]" />
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#7A400B] mt-1">
                  1 <span className="text-xs font-sans font-normal text-[#7A400B]">anomaly</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#C97A2B] mt-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>+$234 beyond baseline</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC]">
                <div className="text-[11px] font-mono text-[#153326] uppercase tracking-wide">
                  Potential Savings
                </div>
                <div className="text-xl sm:text-2xl font-serif font-medium text-[#153326] mt-1">
                  +$245<span className="text-xs font-mono font-normal text-[#2D6A4F]">/mo</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#2D6A4F] mt-1 font-medium">
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>2 simulation models</span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Chart (Finora Inspiration: Spending Velocity Trend) */}
            <div className="p-5 rounded-xl border border-[#E6E6DF] bg-[#FDFDFD]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6E6DF] gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#16201B]">Spending Velocity vs Baseline</h3>
                  <p className="text-xs text-[#62726A]">
                    Calculated using 60-day moving average baselines across all categories
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F5F5F0] p-1 rounded-lg self-start sm:self-auto">
                  {(['30D', '60D', '90D'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
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
                    const heightPercent = Math.round((d.spend / 2600) * 100)
                    const isApril = d.month === 'Apr'

                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                        {/* Tooltip on April / active month */}
                        {isApril && (
                          <div className="absolute -top-3 left-3/4 sm:left-[80%] -translate-x-1/2 bg-[#153326] text-[#F2F7F4] text-[10px] font-mono px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap z-20">
                            <span className="block text-[#9DB4AC]">Apr 2026 Outflow</span>
                            <span className="font-bold">$1,945.84</span> (Baseline $1,900)
                          </div>
                        )}

                        {/* Bar Visual */}
                        <div className="w-full max-w-[40px] relative flex flex-col justify-end h-full">
                          {/* Baseline threshold marker */}
                          <div
                            className="absolute w-full border-t border-dashed border-[#788780]/40 z-10"
                            style={{ bottom: `${(d.baseline / 2600) * 100}%` }}
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

            {/* Forensic Ledger Table (Canonical Transaction List) */}
            <div className="rounded-xl border border-[#E6E6DF] overflow-hidden">
              <div className="px-5 py-3.5 bg-[#FBFBFA] border-b border-[#E6E6DF] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#16201B]">Recent Forensic Ledger Entries</h3>
                  <span className="text-[11px] text-[#788780]">
                    Canonical minor-unit transaction record with investigative tags
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#52796F] bg-[#E3ECE8] px-2 py-0.5 rounded">
                  CSV IMPORT VERIFIED
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
                                SPENDING SPIKE
                              </span>
                            )}
                            {tx.status === 'recurring' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC]">
                                RECURRING CADENCE
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
                          {tx.type === 'income' ? '+' : '-'}${ (tx.amountInCents / 100).toFixed(2) }
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Investigative Annotation Pill (Echoing the Steep reference cursor card) */}
        <div className="hidden lg:flex absolute bottom-8 right-8 z-30 max-w-sm p-4 rounded-xl bg-[#FFFFFF] border border-[#153326]/20 shadow-xl items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#153326] text-[#E3ECE8] flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 font-bold">
            SL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#16201B]">Investigative Agent</span>
              <span className="text-[10px] font-mono text-[#788780]">Apr 28</span>
            </div>
            <p className="text-xs text-[#4B5952] mt-0.5 leading-relaxed">
              Detected recurring charge <span className="font-medium text-[#16201B]">Spotify Family ($16.99)</span> with 99% cadence confidence. Flagged 1 semester textbook outlier for review.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
