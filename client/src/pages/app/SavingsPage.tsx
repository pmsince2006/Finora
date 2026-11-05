import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Calendar,
  RefreshCw,
  EyeOff,
  RotateCcw,
  ReceiptText,
  Info,
  Sliders,
  TrendingUp,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { formatCurrency } from '../../lib/formatCurrency'
import type {
  SavingsOpportunityStatus,
  SavingsEvidenceQuality,
} from '../../types/finance'

type FilterTab = 'all' | 'active' | 'planned' | 'completed' | 'dismissed'
type SortOrder = 'savings-desc' | 'confidence-desc' | 'title-asc'

export const SavingsPage: React.FC = () => {
  const {
    transactions,
    savingsSummary,
    savingsOpportunities,
    saveSavingsOpportunity,
    planSavingsOpportunity,
    completeSavingsOpportunity,
    dismissSavingsOpportunity,
    reinstateSavingsOpportunity,
  } = useFinance()

  const [activeTab, setActiveTab] = useState<FilterTab>('active')
  const [sortOrder, setSortOrder] = useState<SortOrder>('savings-desc')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Interactive Sandbox state linked to real ledger
  const [sandboxTrimPercent, setSandboxTrimPercent] = useState<number>(10)

  // Unique categories from generated opportunities
  const availableCategories = useMemo(() => {
    const cats = new Set(savingsOpportunities.map((o) => o.category))
    return ['all', ...Array.from(cats)]
  }, [savingsOpportunities])

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    return savingsOpportunities.filter((opp) => {
      // Tab filter
      if (activeTab === 'active' && opp.status === 'dismissed') return false
      if (activeTab === 'planned' && opp.status !== 'planned' && opp.status !== 'saved') return false
      if (activeTab === 'completed' && opp.status !== 'completed') return false
      if (activeTab === 'dismissed' && opp.status !== 'dismissed') return false

      // Category filter
      if (selectedCategory !== 'all' && opp.category !== selectedCategory) return false

      return true
    }).sort((a, b) => {
      if (sortOrder === 'savings-desc') {
        return b.potentialMonthlySavings - a.potentialMonthlySavings
      }
      if (sortOrder === 'confidence-desc') {
        const qualityRank: Record<SavingsEvidenceQuality, number> = {
          high: 3,
          moderate: 2,
          preliminary: 1,
        }
        return qualityRank[b.evidenceQuality] - qualityRank[a.evidenceQuality]
      }
      if (sortOrder === 'title-asc') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })
  }, [savingsOpportunities, activeTab, selectedCategory, sortOrder])

  // Real 30-day discretionary spend from actual transactions for Sandbox
  const totalRecentDiscretionarySpend = useMemo(() => {
    const discretionaryList = [
      'Food & Dining',
      'Shopping',
      'Entertainment',
      'Personal Care',
      'Lifestyle',
    ]
    return transactions
      .filter((t) => t.type === 'expense' && discretionaryList.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const sandboxMonthlyCushion = Math.round(
    (totalRecentDiscretionarySpend * sandboxTrimPercent) / 100
  )
  const sandboxAnnualCushion = sandboxMonthlyCushion * 12

  // Badge helpers
  const getQualityBadge = (quality: SavingsEvidenceQuality) => {
    switch (quality) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC]">
            <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" />
            High Evidence
          </span>
        )
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#F0F4F8] text-[#1E3A8A] border border-[#BFDBFE]">
            <Info className="w-3 h-3 text-[#3B82F6]" />
            Moderate Evidence
          </span>
        )
      case 'preliminary':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
            <Clock className="w-3 h-3 text-[#D97706]" />
            Preliminary
          </span>
        )
    }
  }

  const getStatusBadge = (status: SavingsOpportunityStatus) => {
    switch (status) {
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#153326] text-[#FFFFFF]">
            <CheckCircle2 className="w-2.5 h-2.5 text-[#A7F3D0]" />
            Planned
          </span>
        )
      case 'saved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E]">
            <Bookmark className="w-2.5 h-2.5 text-[#D97706]" />
            Saved for Later
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">
            <CheckCircle2 className="w-2.5 h-2.5 text-[#16A34A]" />
            Action Completed
          </span>
        )
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280]">
            <EyeOff className="w-2.5 h-2.5 text-[#9CA3AF]" />
            Dismissed
          </span>
        )
      case 'suggested':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
            Suggested
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Honest Distinction Banner: Potential vs Realized Savings */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold block text-[#0E241B]">
            Transparent Financial Intelligence Notice
          </strong>
          <p className="text-[11px] text-[#35423B] leading-relaxed">
            Figures shown represent <strong>estimated potential savings</strong> derived from verified recurring charges, discretionary category burn rates, and spending anomalies. Realized savings depend on your individual choices and are tracked once you complete an action.
          </p>
        </div>
      </div>

      {/* SECTION B: Summary Metrics Strip (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Opportunities */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-mono text-[#788780] uppercase tracking-wider">
            <span>Active Opportunities</span>
            <Tag className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-medium text-[#16201B] mt-2 tracking-tight">
            {savingsSummary.activeCount}
          </div>
          <div className="mt-1 text-[11px] text-[#62726A] flex items-center gap-1.5">
            <span>{savingsSummary.plannedCount} planned / saved</span>
            <span>•</span>
            <span>{savingsSummary.completedCount} completed</span>
          </div>
        </div>

        {/* Card 2: Estimated Potential Monthly Savings */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-mono text-[#788780] uppercase tracking-wider">
            <span>Potential Monthly</span>
            <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-medium text-[#2D6A4F] mt-2 tracking-tight">
            +{formatCurrency(savingsSummary.totalPotentialMonthly)}
            <span className="text-xs font-mono font-normal text-[#788780] ml-1">/mo</span>
          </div>
          <div className="mt-1 text-[11px] text-[#62726A]">
            Deduplicated net discretionary potential
          </div>
        </div>

        {/* Card 3: Estimated Potential Annual Cushion */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-mono text-[#788780] uppercase tracking-wider">
            <span>Potential Annual</span>
            <Calendar className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-medium text-[#153326] mt-2 tracking-tight">
            +{formatCurrency(savingsSummary.totalPotentialAnnual)}
            <span className="text-xs font-mono font-normal text-[#788780] ml-1">/yr</span>
          </div>
          <div className="mt-1 text-[11px] text-[#62726A]">
            12-month compound projection
          </div>
        </div>

        {/* Card 4: Committed / Planned Levers */}
        <div className="p-5 rounded-2xl bg-[#153326] text-[#FFFFFF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-mono text-[#A2B8AF] uppercase tracking-wider">
            <span>User Commitments</span>
            <CheckCircle2 className="w-4 h-4 text-[#A7F3D0]" />
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-medium text-[#FFFFFF] mt-2 tracking-tight">
            +{formatCurrency(savingsSummary.plannedMonthlySavings)}
            <span className="text-xs font-mono font-normal text-[#A2B8AF] ml-1">/mo</span>
          </div>
          <div className="mt-1 text-[11px] text-[#A2B8AF]">
            {savingsSummary.plannedCount} planned commitments
          </div>
        </div>
      </div>

      {/* SECTION C & D: Filters & Opportunity Cards List */}
      <div className="space-y-4">
        {/* Controls Bar: Tabs, Category filter, and Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[#153326] text-[#FFFFFF]'
                  : 'text-[#62726A] hover:bg-[#F5F5F0]'
              }`}
            >
              Active ({savingsSummary.activeCount})
            </button>
            <button
              onClick={() => setActiveTab('planned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'planned'
                  ? 'bg-[#153326] text-[#FFFFFF]'
                  : 'text-[#62726A] hover:bg-[#F5F5F0]'
              }`}
            >
              Planned &amp; Saved ({savingsSummary.plannedCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-[#153326] text-[#FFFFFF]'
                  : 'text-[#62726A] hover:bg-[#F5F5F0]'
              }`}
            >
              Completed ({savingsSummary.completedCount})
            </button>
            <button
              onClick={() => setActiveTab('dismissed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'dismissed'
                  ? 'bg-[#153326] text-[#FFFFFF]'
                  : 'text-[#62726A] hover:bg-[#F5F5F0]'
              }`}
            >
              Dismissed ({savingsSummary.dismissedCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#153326] text-[#FFFFFF]'
                  : 'text-[#62726A] hover:bg-[#F5F5F0]'
              }`}
            >
              All ({savingsOpportunities.length})
            </button>
          </div>

          {/* Secondary Controls: Category Filter & Sort */}
          <div className="flex items-center gap-2 text-xs">
            {availableCategories.length > 2 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] text-[#16201B] font-mono text-[11px] cursor-pointer"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-2.5 py-1.5 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] text-[#16201B] font-mono text-[11px] cursor-pointer"
            >
              <option value="savings-desc">Highest Potential</option>
              <option value="confidence-desc">Evidence Quality</option>
              <option value="title-asc">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Opportunity Cards Grid */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredOpportunities.map((opp) => (
                <motion.div
                  key={opp.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-5 shadow-2xs hover:border-[#C2D3CC] transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Card Top: Badges & Potential Savings */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F5F0] text-[#16201B] font-medium">
                          {opp.category}
                        </span>
                        {getQualityBadge(opp.evidenceQuality)}
                        {getStatusBadge(opp.status)}
                      </div>

                      {opp.potentialMonthlySavings > 0 ? (
                        <div className="text-right shrink-0">
                          <div className="text-base font-serif font-medium text-[#2D6A4F]">
                            +{formatCurrency(opp.potentialMonthlySavings)}
                            <span className="text-[10px] font-mono font-normal text-[#788780] ml-0.5">
                              /mo
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-[#788780]">
                            +{formatCurrency(opp.potentialAnnualSavings)}/yr
                          </div>
                        </div>
                      ) : opp.type === 'recurring_review' ? (
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono font-medium text-[#1E3A8A]">
                            {formatCurrency(opp.currentMonthlySpend ?? 0)}
                            <span className="text-[10px] text-[#6B7280]">/mo</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#6B7280]">
                            Active Outflow
                          </div>
                        </div>
                      ) : opp.type === 'merchant_concentration' ? (
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono font-medium text-[#374151]">
                            {opp.sourceRecordCount} orders
                          </div>
                          <div className="text-[10px] font-mono text-[#6B7280]">
                            {formatCurrency(opp.currentMonthlySpend ?? 0)} spend
                          </div>
                        </div>
                      ) : (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E]">
                            Invoice Audit
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Title & Rationale */}
                    <h3 className="text-base font-serif font-medium text-[#16201B] mt-3">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-[#62726A] mt-1.5 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Evidence & Calculation Pill */}
                    <div className="mt-3 p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5 text-[#35423B]">
                        <Info className="w-3.5 h-3.5 text-[#52796F] shrink-0 mt-0.5" />
                        <span>
                          <strong>Evidence:</strong> {opp.explanation}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[#62726A]">
                        <Sliders className="w-3.5 h-3.5 text-[#788780] shrink-0 mt-0.5" />
                        <span>
                          <strong>Basis:</strong> {opp.calculationMethod}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[#153326] font-medium pt-1 border-t border-[#E6E6DF]/60">
                        <ArrowRight className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                        <span>
                          <strong>Recommended:</strong> {opp.recommendedAction}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Toolbar */}
                  <div className="pt-3 border-t border-[#E6E6DF] flex items-center justify-between gap-2 text-xs">
                    {/* Status Actions */}
                    <div className="flex items-center gap-1.5">
                      {opp.status !== 'planned' && opp.status !== 'completed' && opp.status !== 'dismissed' && (
                        <button
                          onClick={() => planSavingsOpportunity(opp.opportunityKey)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#153326] text-[#FFFFFF] font-medium hover:bg-[#1E4D38] transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#A7F3D0]" />
                          <span>Plan Target</span>
                        </button>
                      )}

                      {opp.status !== 'saved' && opp.status !== 'completed' && opp.status !== 'dismissed' && (
                        <button
                          onClick={() => saveSavingsOpportunity(opp.opportunityKey)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F5F5F0] text-[#16201B] font-medium hover:bg-[#E6E6DF] transition-colors cursor-pointer"
                        >
                          <Bookmark className="w-3 h-3 text-[#788780]" />
                          <span>Save</span>
                        </button>
                      )}

                      {opp.status !== 'completed' && opp.status !== 'dismissed' && (
                        <button
                          onClick={() => completeSavingsOpportunity(opp.opportunityKey)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#DCFCE7] text-[#166534] font-medium hover:bg-[#BBF7D0] transition-colors cursor-pointer"
                          title="Record that you completed this action in real life"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                          <span>Mark Done</span>
                        </button>
                      )}

                      {(opp.status === 'completed' || opp.status === 'dismissed') && (
                        <button
                          onClick={() => reinstateSavingsOpportunity(opp.opportunityKey)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F5F5F0] text-[#16201B] font-medium hover:bg-[#E6E6DF] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-[#52796F]" />
                          <span>Restore Opportunity</span>
                        </button>
                      )}
                    </div>

                    {/* Dismiss Action */}
                    {opp.status !== 'dismissed' && (
                      <button
                        onClick={() => dismissSavingsOpportunity(opp.opportunityKey)}
                        className="p-1.5 text-[#788780] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                        title="Dismiss this recommendation"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* SECTION E: Empty and Insufficient-Data States */
          <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F7F4] text-[#2D6A4F] mx-auto flex items-center justify-center">
              <ReceiptText className="w-6 h-6" />
            </div>

            {transactions.length === 0 ? (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-serif font-medium text-[#16201B]">
                  No Transactions Recorded
                </h3>
                <p className="text-xs text-[#62726A] leading-relaxed">
                  Finora analyzes your actual bank and UPI transaction ledger to uncover savings opportunities. Add or import transactions to activate the lab.
                </p>
                <div className="pt-2">
                  <Link
                    to="/app/transactions"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153326] text-[#FFFFFF] text-xs font-medium hover:bg-[#1E4D38] transition-colors cursor-pointer"
                  >
                    <span>Open Money Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : savingsOpportunities.length === 0 ? (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-serif font-medium text-[#16201B]">
                  Insufficient Spending History
                </h3>
                <p className="text-xs text-[#62726A] leading-relaxed">
                  Your ledger currently has {transactions.length} record(s). Finora requires at least 3 transactions in a discretionary category or 2 repeat billing cycles before generating trustworthy savings recommendations.
                </p>
                <div className="pt-2">
                  <Link
                    to="/app/transactions"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153326] text-[#FFFFFF] text-xs font-medium hover:bg-[#1E4D38] transition-colors cursor-pointer"
                  >
                    <span>Record More Transactions</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-serif font-medium text-[#16201B]">
                  No Opportunities in this View
                </h3>
                <p className="text-xs text-[#62726A] leading-relaxed">
                  You have reviewed all opportunities matching the <strong>{activeTab}</strong> tab and selected filter.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('all')
                      setSelectedCategory('all')
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F5F0] text-[#16201B] text-xs font-medium hover:bg-[#E6E6DF] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#52796F]" />
                    <span>Reset View to All</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION F: Real-Data Behavioral Sandbox Simulation */}
      {totalRecentDiscretionarySpend > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#153326]" />
                <h2 className="text-base font-serif font-medium text-[#16201B]">
                  Interactive Discretionary Sandbox
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#52796F]">
                DERIVED FROM ACTUAL LEDGER
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-[#16201B]">
                <span>Discretionary Outflow Trim</span>
                <span className="font-mono text-[#153326] bg-[#E3ECE8] px-2 py-0.5 rounded text-[11px]">
                  {sandboxTrimPercent}% ({formatCurrency(sandboxMonthlyCushion)}/mo cushion)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={sandboxTrimPercent}
                onChange={(e) => setSandboxTrimPercent(Number(e.target.value))}
                className="w-full accent-[#153326] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#788780]">
                <span>0% (As-is)</span>
                <span>10% (Recommended)</span>
                <span>20% (Target)</span>
                <span>30% (Aggressive)</span>
              </div>
            </div>

            <div className="text-[11px] text-[#62726A] leading-relaxed pt-2 border-t border-[#E6E6DF]/60">
              Applies a variable percentage trim to your actual recorded discretionary spend (Food &amp; Dining, Shopping, Entertainment, Lifestyle) of <strong>{formatCurrency(totalRecentDiscretionarySpend)}</strong>.
            </div>
          </div>

          {/* Projection Column */}
          <div className="lg:col-span-5 bg-[#153326] text-[#F2F7F4] rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B4332] text-[#E3ECE8] text-[10px] font-mono mb-4 border border-[#2D6A4F]">
                <Sparkles className="w-3 h-3 text-[#74968C]" />
                <span>PROJECTED SAVINGS CUSHION</span>
              </div>

              <div className="text-xs font-mono text-[#9DB4AC] uppercase tracking-wider">
                Monthly Accumulated Cushion
              </div>
              <div className="text-3xl lg:text-4xl font-serif font-medium text-[#FFFFFF] mt-1 tracking-tight">
                +{formatCurrency(sandboxMonthlyCushion)}
                <span className="text-xs font-mono font-normal text-[#9DB4AC] ml-1">/mo</span>
              </div>

              <div className="mt-6 space-y-3 pt-4 border-t border-[#1B4332]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DB4AC]">6-Month Cushion:</span>
                  <span className="font-mono font-medium text-[#FFFFFF]">
                    +{formatCurrency(sandboxMonthlyCushion * 6)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DB4AC]">1-Year Total Capital:</span>
                  <span className="font-mono font-medium text-[#FFFFFF]">
                    +{formatCurrency(sandboxAnnualCushion)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1B4332] text-[11px] text-[#9DB4AC] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#74968C] shrink-0" />
              <span>Deterministic model based on your canonical ledger transactions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavingsPage
