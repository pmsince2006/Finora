import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Repeat,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinance } from '../../context/useFinance'
import { useToast } from '../../context/useToast'
import { formatCurrency } from '../../lib/formatCurrency'
import type { RecurringCandidate } from '../../types/finance'

type StatusFilter = 'active' | 'suggested' | 'confirmed' | 'dismissed'
type SortOption = 'cost-desc' | 'date-asc' | 'confidence-desc' | 'recent-desc' | 'name-asc'

export const RecurringPage: React.FC = () => {
  const {
    recurringAnalysis,
    confirmRecurringCandidate,
    dismissRecurringCandidate,
    reinstateRecurringCandidate,
    transactions,
  } = useFinance()
  const { showToast, showUndoToast } = useToast()

  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [cadenceFilter, setCadenceFilter] = useState<string>('ALL')
  const [sortOption, setSortOption] = useState<SortOption>('cost-desc')
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null)

  const summary = recurringAnalysis.summary

  // Base list depending on active status tab
  const baseCandidates = useMemo(() => {
    switch (statusFilter) {
      case 'confirmed':
        return recurringAnalysis.confirmedCandidates
      case 'suggested':
        return recurringAnalysis.suggestedCandidates
      case 'dismissed':
        return recurringAnalysis.dismissedCandidates
      case 'active':
      default:
        return recurringAnalysis.activeCandidates
    }
  }, [statusFilter, recurringAnalysis])

  // Filter by Cadence
  const filteredCandidates = useMemo(() => {
    return baseCandidates.filter((cand) => {
      if (cadenceFilter !== 'ALL' && cand.cadence !== cadenceFilter) {
        return false
      }
      return true
    })
  }, [baseCandidates, cadenceFilter])

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    const list = [...filteredCandidates]
    list.sort((a, b) => {
      if (sortOption === 'cost-desc') {
        return b.monthlyEquivalent - a.monthlyEquivalent
      }
      if (sortOption === 'date-asc') {
        if (!a.nextExpected && !b.nextExpected) return 0
        if (!a.nextExpected) return 1
        if (!b.nextExpected) return -1
        return a.nextExpected.localeCompare(b.nextExpected)
      }
      if (sortOption === 'confidence-desc') {
        return b.confidence - a.confidence
      }
      if (sortOption === 'recent-desc') {
        return b.lastBilled.localeCompare(a.lastBilled)
      }
      if (sortOption === 'name-asc') {
        return a.merchant.localeCompare(b.merchant)
      }
      return 0
    })
    return list
  }, [filteredCandidates, sortOption])

  // Quick action: Confirm
  const handleConfirm = (candidate: RecurringCandidate) => {
    confirmRecurringCandidate(candidate.candidateKey)
    showToast(
      `Marked "${candidate.merchant}" as a confirmed recurring commitment.`,
      'success'
    )
  }

  // Quick action: Dismiss with Undo
  const handleDismiss = (candidate: RecurringCandidate) => {
    dismissRecurringCandidate(candidate.candidateKey)
    showUndoToast(
      `Dismissed "${candidate.merchant}" from active recurring commitments.`,
      () => {
        reinstateRecurringCandidate(candidate.candidateKey)
      }
    )
  }

  // Quick action: Reinstate
  const handleReinstate = (candidate: RecurringCandidate) => {
    reinstateRecurringCandidate(candidate.candidateKey)
    showToast(
      `Reopened "${candidate.merchant}" for recurring investigation.`,
      'info'
    )
  }

  // Toggle transaction evidence disclosure
  const toggleExpanded = (candidateId: string) => {
    setExpandedCandidateId((prev) => (prev === candidateId ? null : candidateId))
  }

  // Get matching transaction objects for a candidate
  const getSupportingTransactions = (candidate: RecurringCandidate) => {
    const idSet = new Set(candidate.matchingTransactionIds)
    return transactions
      .filter((t) => idSet.has(t.id))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const reviewStats = summary.reviewStats || {
    totalDetected: 0,
    suggestedCount: 0,
    confirmedCount: 0,
    dismissedCount: 0,
  }

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <Zap className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="font-semibold text-[#0E241B]">
              Real-Time Ledger Intelligence Active
            </strong>
            <span className="text-[10px] font-mono bg-[#E3ECE8] text-[#153326] px-2 py-0.5 rounded font-medium">
              {summary.candidateCount} ACTIVE OBLIGATIONS
            </span>
          </div>
          <p className="text-[11px] text-[#35423B] leading-relaxed">
            All repeat expenses below are dynamically computed from your active Money Ledger. Confirm subscriptions you know, or dismiss false positives to tune your monthly commitment run-rate.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Monthly Commitment */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Monthly Recurring Spend
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            {formatCurrency(summary.monthlyCommitment)}
            <span className="text-xs font-mono font-normal text-[#788780] ml-1">/mo</span>
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block font-mono">
            Annual commitment: {formatCurrency(summary.annualCommitment)}
          </span>
        </div>

        {/* KPI 2: Active Services Tracked */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Active Services Tracked
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            {summary.candidateCount}
            <span className="text-xs font-mono font-normal text-[#788780] ml-1">services</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#2D6A4F] mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{reviewStats.confirmedCount} confirmed by you</span>
          </div>
        </div>

        {/* KPI 3: Next 30 Days Due */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Due in Next 30 Days
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            {(summary.upcomingCharges30Days || []).length}
            <span className="text-xs font-mono font-normal text-[#788780] ml-1">upcoming charges</span>
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block font-mono">
            Est. upcoming: {formatCurrency(
              (summary.upcomingCharges30Days || []).reduce((sum, item) => sum + item.amount, 0)
            )}
          </span>
        </div>
      </div>

      {/* Upcoming Charges Mini Strip (if any upcoming in 30 days) */}
      {(summary.upcomingCharges30Days || []).length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2D6A4F]" />
              <h3 className="text-xs font-semibold text-[#16201B] uppercase tracking-wider font-mono">
                Upcoming Charges (Next 30 Days)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#788780]">
              {(summary.upcomingCharges30Days || []).length} EXPECTED
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(summary.upcomingCharges30Days || []).map((charge, idx) => (
              <div
                key={`${charge.merchant}-${charge.date}-${idx}`}
                className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] hover:border-[#D4D4CA] transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#16201B] truncate max-w-[130px]" title={charge.merchant}>
                    {charge.merchant}
                  </span>
                  <span className="font-mono font-medium text-[#16201B]">
                    {formatCurrency(charge.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#788780] mt-1 font-mono">
                  <span>{charge.date}</span>
                  <span className="bg-[#E3ECE8] text-[#153326] px-1.5 py-0.2 rounded">
                    {charge.cadence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Controls & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-2xl border border-[#E6E6DF] shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            All Active ({recurringAnalysis.activeCandidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'confirmed'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            Confirmed ({reviewStats.confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter('suggested')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'suggested'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            Needs Review ({reviewStats.suggestedCount})
          </button>
          <button
            onClick={() => setStatusFilter('dismissed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'dismissed'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            Dismissed ({reviewStats.dismissedCount})
          </button>
        </div>

        {/* Cadence & Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Cadence filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#62726A]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#788780]" />
            <select
              value={cadenceFilter}
              onChange={(e) => setCadenceFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-xs text-[#16201B] focus:outline-none focus:border-[#153326] cursor-pointer"
            >
              <option value="ALL">All Cadences</option>
              <option value="Weekly">Weekly</option>
              <option value="Fortnightly">Fortnightly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
              <option value="Irregular / Uncertain">Irregular / Uncertain</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-xs text-[#16201B] focus:outline-none focus:border-[#153326] cursor-pointer"
          >
            <option value="cost-desc">Highest Monthly Cost</option>
            <option value="date-asc">Next Payment Date</option>
            <option value="confidence-desc">Highest Confidence</option>
            <option value="recent-desc">Most Recently Billed</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Candidate List Container */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E6E6DF] flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-medium text-[#16201B]">
              {statusFilter === 'active' && 'Active Recurring Commitments'}
              {statusFilter === 'confirmed' && 'User-Confirmed Subscriptions'}
              {statusFilter === 'suggested' && 'Suggested Candidates (Pending Review)'}
              {statusFilter === 'dismissed' && 'Dismissed Candidates (False Positives)'}
            </h2>
            <p className="text-xs text-[#62726A] mt-0.5">
              Showing {sortedCandidates.length} of {baseCandidates.length} services matching current filters.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#52796F] uppercase">
            {sortOption.replace('-', ' ')}
          </span>
        </div>

        {/* Empty State */}
        {sortedCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#788780] flex items-center justify-center mx-auto">
              <Repeat className="w-6 h-6 text-[#52796F]" />
            </div>
            <h3 className="text-sm font-medium text-[#16201B]">
              No recurring commitments found
            </h3>
            <p className="text-xs text-[#62726A] max-w-sm mx-auto leading-relaxed">
              {statusFilter === 'dismissed'
                ? 'No recurring candidates have been dismissed. False positives you dismiss will appear here and can be reinstated anytime.'
                : statusFilter === 'confirmed'
                ? 'You have not confirmed any subscriptions yet. Click "Confirm" on any suggested candidate to pin it as verified.'
                : 'The Recurring Detective isolates patterns when multiple expenses occur on regular intervals (e.g. weekly or monthly). Add or import more billing cycles to detect commitments.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5F0]">
            {sortedCandidates.map((cand) => {
              const isExpanded = expandedCandidateId === cand.id
              const supportingTxs = isExpanded ? getSupportingTransactions(cand) : []

              return (
                <div key={cand.id} className="p-4 sm:p-5 hover:bg-[#FBFBFA] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Merchant Info, Cadence, Status, Confidence */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E3ECE8] text-[#153326] flex items-center justify-center shrink-0 mt-0.5">
                        <Repeat className="w-5 h-5 text-[#2D6A4F]" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-[#16201B]">
                            {cand.merchant}
                          </h3>

                          {/* Review Status Pill */}
                          {cand.reviewStatus === 'confirmed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                              Confirmed by you
                            </span>
                          )}
                          {cand.reviewStatus === 'suggested' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FBFBFA] text-[#62726A] border border-[#E6E6DF]">
                              System Suggested
                            </span>
                          )}
                          {cand.reviewStatus === 'dismissed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFF5F5] text-[#B83A2E] border border-[#F3C4BE] flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Dismissed
                            </span>
                          )}
                        </div>

                        {/* Meta strip */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#62726A] mt-1 font-mono">
                          <span className="text-[#35423B] font-sans">{cand.category}</span>
                          <span>•</span>
                          <span className="text-[#153326] bg-[#F5F5F0] px-1.5 py-0.5 rounded text-[11px]">
                            {cand.cadence}
                          </span>
                          <span>•</span>
                          <span>
                            {cand.occurrenceCount} billing cycles
                          </span>
                          <span>•</span>
                          <span className="text-[#2D6A4F] font-semibold">
                            {Math.round(cand.confidence * 100)}% confidence
                          </span>
                        </div>

                        {/* Plain English Explanation */}
                        <p className="text-xs text-[#52796F] mt-1.5 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 text-[#2D6A4F]" />
                          <span>{cand.explanation}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Amounts, Next Date & Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F5F5F0]">
                      {/* Dates */}
                      <div className="text-left sm:text-right min-w-[110px]">
                        <div className="text-[11px] font-mono text-[#788780]">
                          Next Expected
                        </div>
                        <div className="text-xs font-mono font-medium text-[#16201B] mt-0.5">
                          {cand.nextExpected || 'Uncertain / Pending'}
                        </div>
                        <div className="text-[10px] font-mono text-[#788780] mt-0.5">
                          Last billed: {cand.lastBilled}
                        </div>
                      </div>

                      {/* Cost metrics */}
                      <div className="text-right min-w-[110px]">
                        <div className="text-base font-serif font-medium text-[#16201B]">
                          {formatCurrency(cand.amount)}
                        </div>
                        <div className="text-[10px] font-mono text-[#788780]">
                          {cand.cadence !== 'Monthly' && (
                            <span className="text-[#2D6A4F] font-medium block">
                              ≈ {formatCurrency(cand.monthlyEquivalent)}/mo
                            </span>
                          )}
                          <span>per {cand.cadence.toLowerCase()}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* View Evidence / Transactions */}
                        <button
                          onClick={() => toggleExpanded(cand.id)}
                          title="View underlying transaction evidence"
                          className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] hover:bg-[#F5F5F0] text-xs text-[#35423B] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="text-[11px] font-medium">History</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#788780]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#788780]" />
                          )}
                        </button>

                        {/* Confirm Button */}
                        {cand.reviewStatus !== 'confirmed' && cand.reviewStatus !== 'dismissed' && (
                          <button
                            onClick={() => handleConfirm(cand)}
                            title="Confirm as active subscription"
                            className="px-2.5 py-1.5 rounded-xl bg-[#E3ECE8] hover:bg-[#D1E2DB] text-[#153326] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {/* Dismiss Button */}
                        {cand.reviewStatus !== 'dismissed' && (
                          <button
                            onClick={() => handleDismiss(cand)}
                            title="Dismiss false positive"
                            className="p-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] hover:bg-[#FFF5F5] hover:text-[#B83A2E] hover:border-[#F3C4BE] text-[#788780] transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reinstate Button */}
                        {cand.reviewStatus === 'dismissed' && (
                          <button
                            onClick={() => handleReinstate(cand)}
                            title="Reinstate to active list"
                            className="px-2.5 py-1.5 rounded-xl bg-[#E3ECE8] hover:bg-[#D1E2DB] text-[#153326] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>Reinstate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Supporting Transaction Evidence Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-[#E6E6DF]"
                      >
                        <div className="bg-[#FBFBFA] rounded-xl p-3.5 border border-[#E6E6DF]">
                          <div className="flex items-center justify-between mb-2.5">
                            <h4 className="text-xs font-semibold text-[#16201B] flex items-center gap-1.5">
                              <span>Underlying Transaction Evidence ({supportingTxs.length})</span>
                            </h4>
                            <Link
                              to="/app/transactions"
                              className="text-[11px] text-[#52796F] hover:text-[#153326] flex items-center gap-1 font-medium"
                            >
                              <span>Open in Ledger</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          <div className="space-y-2">
                            {supportingTxs.map((tx) => (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-medium text-[#16201B]">
                                    {tx.description}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#788780] flex items-center gap-2">
                                    <span>{tx.date}</span>
                                    <span>•</span>
                                    <span>{tx.account || 'Checking Account'}</span>
                                    {tx.notes && (
                                      <>
                                        <span>•</span>
                                        <span className="italic">{tx.notes}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-medium text-[#16201B]">
                                    {formatCurrency(tx.amount)}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#52796F]">
                                    {tx.type}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
