import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  ShieldAlert,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinance } from '../../context/useFinance'
import { useToast } from '../../context/useToast'
import { formatCurrency } from '../../lib/formatCurrency'
import type { AnomalyFinding } from '../../types/finance'

type StatusFilter = 'active' | 'high' | 'reviewed' | 'dismissed'
type SortOption = 'deviation-desc' | 'ratio-desc' | 'date-desc' | 'date-asc'

export const InvestigationsPage: React.FC = () => {
  const {
    anomalyAnalysis,
    reviewAnomalyFinding,
    dismissAnomalyFinding,
    reinstateAnomalyFinding,
    transactions,
  } = useFinance()
  const { showToast, showUndoToast } = useToast()

  // State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [sortOption, setSortOption] = useState<SortOption>('deviation-desc')
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null)

  const summary = anomalyAnalysis.summary

  // Base list according to active status tab
  const baseFindings = useMemo(() => {
    switch (statusFilter) {
      case 'high':
        return anomalyAnalysis.activeFindings.filter((f) => f.severity === 'high')
      case 'reviewed':
        return anomalyAnalysis.reviewedFindings
      case 'dismissed':
        return anomalyAnalysis.dismissedFindings
      case 'active':
      default:
        return anomalyAnalysis.activeFindings
    }
  }, [statusFilter, anomalyAnalysis])

  // Derive unique categories from findings for filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    anomalyAnalysis.allFindings.forEach((f) => cats.add(f.category))
    return Array.from(cats).sort()
  }, [anomalyAnalysis])

  // Filter pipeline
  const filteredFindings = useMemo(() => {
    return baseFindings.filter((finding) => {
      if (severityFilter !== 'ALL' && finding.severity !== severityFilter) {
        return false
      }
      if (categoryFilter !== 'ALL' && finding.category !== categoryFilter) {
        return false
      }
      return true
    })
  }, [baseFindings, severityFilter, categoryFilter])

  // Sorting pipeline
  const sortedFindings = useMemo(() => {
    const list = [...filteredFindings]
    list.sort((a, b) => {
      if (sortOption === 'deviation-desc') {
        return b.absoluteDeviation - a.absoluteDeviation
      }
      if (sortOption === 'ratio-desc') {
        return b.ratio - a.ratio
      }
      if (sortOption === 'date-desc') {
        return b.date.localeCompare(a.date)
      }
      if (sortOption === 'date-asc') {
        return a.date.localeCompare(b.date)
      }
      return 0
    })
    return list
  }, [filteredFindings, sortOption])

  // Handlers
  const handleReview = (finding: AnomalyFinding) => {
    reviewAnomalyFinding(finding.findingKey)
    showToast(
      `Marked "${finding.merchant}" (${formatCurrency(finding.amount)}) as verified.`,
      'success'
    )
  }

  const handleDismiss = (finding: AnomalyFinding) => {
    dismissAnomalyFinding(finding.findingKey)
    showUndoToast(
      `Dismissed anomaly alert for "${finding.merchant}".`,
      () => {
        reinstateAnomalyFinding(finding.findingKey)
      }
    )
  }

  const handleReinstate = (finding: AnomalyFinding) => {
    reinstateAnomalyFinding(finding.findingKey)
    showToast(`Reopened anomaly file for "${finding.merchant}".`, 'info')
  }

  const toggleExpanded = (findingId: string) => {
    setExpandedFindingId((prev) => (prev === findingId ? null : findingId))
  }

  // Retrieve comparable historical transactions used in baseline calculation
  const getComparableTransactions = (finding: AnomalyFinding) => {
    const idSet = new Set(finding.comparableTransactionIds)
    return transactions
      .filter((t) => idSet.has(t.id))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="p-4 rounded-2xl bg-[#FCF4EB]/70 border border-[#F3D7BD] text-xs text-[#C97A2B] flex items-start gap-3">
        <Zap className="w-5 h-5 text-[#C97A2B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="font-semibold text-[#16201B]">
              Real-Time Forensic Radar Active
            </strong>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCF4EB] text-[#C97A2B] border border-[#F3D7BD] font-medium">
              {summary.reviewableCount} ACTIVE ANOMALIES
            </span>
          </div>
          <p className="text-[11px] text-[#35423B] leading-relaxed">
            Every transaction is evaluated strictly against preceding historical expenditures in its category using Median Absolute Deviation (MAD). Verify expected major expenses or dismiss false positives to tune your ledger.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Findings Count */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Active Findings
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5 flex items-baseline gap-2">
            <span>{summary.reviewableCount}</span>
            <span className="text-xs font-mono font-normal text-[#C97A2B]">alerts</span>
          </div>
          <span className="text-[11px] text-[#62726A] mt-1 block font-mono">
            {formatCurrency(summary.spikesTotal)} total spend
          </span>
        </div>

        {/* KPI 2: High Severity Count */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            High-Severity Spikes
          </span>
          <div className="text-2xl font-serif font-medium text-[#B83A2E] mt-1.5 flex items-baseline gap-2">
            <span>{summary.highSeverityCount || 0}</span>
            <span className="text-xs font-mono font-normal text-[#788780]">spikes</span>
          </div>
          <span className="text-[11px] text-[#788780] mt-1 block">
            Exceeding 3.0x baseline threshold
          </span>
        </div>

        {/* KPI 3: Reviewed Findings */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Reviewed Findings
          </span>
          <div className="text-2xl font-serif font-medium text-[#2D6A4F] mt-1.5 flex items-baseline gap-2">
            <span>{summary.reviewedCount || 0}</span>
            <span className="text-xs font-mono font-normal text-[#788780]">verified</span>
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block">
            {summary.dismissedCount || 0} dismissed
          </span>
        </div>

        {/* KPI 4: Categories Affected */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Categories Affected
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5 flex items-baseline gap-2">
            <span>{summary.categoriesAffected || 0}</span>
            <span className="text-xs font-mono font-normal text-[#788780]">categories</span>
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block">
            With active anomaly alerts
          </span>
        </div>
      </div>

      {/* Interactive Toolbar & Filters */}
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
            All Active ({anomalyAnalysis.activeFindings.length})
          </button>
          <button
            onClick={() => setStatusFilter('high')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'high'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            High Severity ({summary.highSeverityCount || 0})
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'reviewed'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            Verified ({summary.reviewedCount || 0})
          </button>
          <button
            onClick={() => setStatusFilter('dismissed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'dismissed'
                ? 'bg-[#153326] text-[#FFFFFF]'
                : 'text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B]'
            }`}
          >
            Dismissed ({summary.dismissedCount || 0})
          </button>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-xs text-[#16201B] focus:outline-none focus:border-[#153326] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-xs text-[#16201B] focus:outline-none focus:border-[#153326] cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>

          {/* Sort Option */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-xs text-[#16201B] focus:outline-none focus:border-[#153326] cursor-pointer"
          >
            <option value="deviation-desc">Highest Rupee Spike</option>
            <option value="ratio-desc">Highest Multiplier</option>
            <option value="date-desc">Newest Date First</option>
            <option value="date-asc">Oldest Date First</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E6E6DF] flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-medium text-[#16201B]">
              {statusFilter === 'active' && 'Active Spending Outliers'}
              {statusFilter === 'high' && 'High-Severity Outlier Files'}
              {statusFilter === 'reviewed' && 'Verified Outlier Transactions'}
              {statusFilter === 'dismissed' && 'Dismissed Outlier Alerts'}
            </h2>
            <p className="text-xs text-[#62726A] mt-0.5">
              Showing {sortedFindings.length} of {baseFindings.length} findings matching filters.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#52796F] uppercase">
            {sortOption.replace('-', ' ')}
          </span>
        </div>

        {/* Empty State */}
        {sortedFindings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#788780] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-[#52796F]" />
            </div>
            <h3 className="text-sm font-medium text-[#16201B]">
              No spending anomalies detected
            </h3>
            <p className="text-xs text-[#62726A] max-w-sm mx-auto leading-relaxed">
              {statusFilter === 'dismissed'
                ? 'No findings have been dismissed. Outliers you dismiss will appear here and can be restored anytime.'
                : statusFilter === 'reviewed'
                ? 'No transactions have been marked as verified yet. Click "Verify" on any finding you acknowledge.'
                : 'All transactions currently align with typical historical baselines. Anomalies are flagged when expenses exceed 2.0x normal category medians.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5F0]">
            {sortedFindings.map((finding) => {
              const isExpanded = expandedFindingId === finding.id
              const comparableTxs = isExpanded ? getComparableTransactions(finding) : []

              return (
                <div key={finding.id} className="p-4 sm:p-5 hover:bg-[#FBFBFA] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Merchant, Severity Pill, Explanation */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          finding.severity === 'high'
                            ? 'bg-[#FDF1EF] text-[#B83A2E]'
                            : finding.severity === 'medium'
                            ? 'bg-[#FCF4EB] text-[#C97A2B]'
                            : 'bg-[#F5F5F0] text-[#52796F]'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-[#16201B]">
                            {finding.merchant}
                          </h3>

                          {/* Severity Pill */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              finding.severity === 'high'
                                ? 'bg-[#FDF1EF] text-[#B83A2E] border border-[#F3C4BE]'
                                : finding.severity === 'medium'
                                ? 'bg-[#FCF4EB] text-[#C97A2B] border border-[#F3D7BD]'
                                : 'bg-[#F5F5F0] text-[#52796F] border border-[#E6E6DF]'
                            }`}
                          >
                            {finding.severity.toUpperCase()} SEVERITY
                          </span>

                          {/* Review Status Pill */}
                          {finding.reviewStatus === 'reviewed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                              Verified by you
                            </span>
                          )}
                          {finding.reviewStatus === 'dismissed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFF5F5] text-[#B83A2E] border border-[#F3C4BE] flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Dismissed
                            </span>
                          )}

                          {/* Evidence Quality Pill */}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#F5F5F0] text-[#788780] border border-[#E6E6DF]">
                            {finding.evidenceQuality.toUpperCase()} EVIDENCE
                          </span>
                        </div>

                        {/* Metadata strip */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#62726A] mt-1 font-mono">
                          <span className="text-[#35423B] font-sans">{finding.category}</span>
                          <span>•</span>
                          <span className="text-[#B83A2E] font-semibold">
                            {finding.ratio}x normal
                          </span>
                          <span>•</span>
                          <span className="text-[#52796F]">
                            +{formatCurrency(finding.absoluteDeviation)} spike
                          </span>
                          <span>•</span>
                          <span>{finding.date}</span>
                        </div>

                        {/* Plain English Explanation */}
                        <p className="text-xs text-[#52796F] mt-1.5 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 text-[#2D6A4F]" />
                          <span>{finding.reason}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Amounts & Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F5F5F0]">
                      {/* Expected Baseline */}
                      <div className="text-left sm:text-right min-w-[100px]">
                        <div className="text-[11px] font-mono text-[#788780]">
                          Typical Baseline
                        </div>
                        <div className="text-xs font-mono font-medium text-[#62726A] mt-0.5">
                          {formatCurrency(finding.baselineAmount)}
                        </div>
                        <div className="text-[10px] font-mono text-[#788780]">
                          {finding.sampleCount} prior expenses
                        </div>
                      </div>

                      {/* Recorded Outflow */}
                      <div className="text-right min-w-[110px]">
                        <div className="text-[11px] font-mono text-[#788780]">
                          Recorded Outflow
                        </div>
                        <div className="text-base font-serif font-medium text-[#B83A2E] mt-0.5">
                          {formatCurrency(finding.amount)}
                        </div>
                        <div className="text-[10px] font-mono text-[#B83A2E]">
                          +{formatCurrency(finding.absoluteDeviation)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Evidence inspection button */}
                        <button
                          onClick={() => toggleExpanded(finding.id)}
                          title="Inspect forensic baseline evidence"
                          className="px-2.5 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] hover:bg-[#F5F5F0] text-xs text-[#35423B] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="text-[11px] font-medium">Evidence</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#788780]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#788780]" />
                          )}
                        </button>

                        {/* Review / Verify Button */}
                        {finding.reviewStatus !== 'reviewed' && finding.reviewStatus !== 'dismissed' && (
                          <button
                            onClick={() => handleReview(finding)}
                            title="Verify as expected expense"
                            className="px-2.5 py-1.5 rounded-xl bg-[#E3ECE8] hover:bg-[#D1E2DB] text-[#153326] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>Verify</span>
                          </button>
                        )}

                        {/* Dismiss Button */}
                        {finding.reviewStatus !== 'dismissed' && (
                          <button
                            onClick={() => handleDismiss(finding)}
                            title="Dismiss false positive alert"
                            className="p-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] hover:bg-[#FFF5F5] hover:text-[#B83A2E] hover:border-[#F3C4BE] text-[#788780] transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Restore Button */}
                        {finding.reviewStatus === 'dismissed' && (
                          <button
                            onClick={() => handleReinstate(finding)}
                            title="Restore alert to active list"
                            className="px-2.5 py-1.5 rounded-xl bg-[#E3ECE8] hover:bg-[#D1E2DB] text-[#153326] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>Restore</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Evidence Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-[#E6E6DF]"
                      >
                        <div className="bg-[#FBFBFA] rounded-xl p-4 border border-[#E6E6DF] space-y-3">
                          {/* Forensic Stats Breakdown */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E6DF]">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-[#2D6A4F]" />
                              <h4 className="text-xs font-semibold text-[#16201B]">
                                Historical Baseline Evidence
                              </h4>
                              <span className="text-[10px] font-mono text-[#52796F] bg-[#E3ECE8] px-1.5 py-0.5 rounded">
                                {finding.baselineMethod.toUpperCase()} BASELINE
                              </span>
                            </div>

                            <Link
                              to="/app/transactions"
                              className="text-[11px] text-[#52796F] hover:text-[#153326] flex items-center gap-1 font-medium"
                            >
                              <span>Inspect in Ledger</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Statistical Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]">
                              <span className="text-[10px] font-mono text-[#788780] block">
                                Sample Median
                              </span>
                              <span className="font-mono font-medium text-[#16201B]">
                                {formatCurrency(finding.stats?.median || finding.baselineAmount)}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]">
                              <span className="text-[10px] font-mono text-[#788780] block">
                                Sample Mean
                              </span>
                              <span className="font-mono font-medium text-[#16201B]">
                                {formatCurrency(finding.stats?.mean || finding.baselineAmount)}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]">
                              <span className="text-[10px] font-mono text-[#788780] block">
                                Robust MAD
                              </span>
                              <span className="font-mono font-medium text-[#16201B]">
                                {formatCurrency(finding.stats?.mad || 0)}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]">
                              <span className="text-[10px] font-mono text-[#788780] block">
                                Reference Window
                              </span>
                              <span className="font-mono font-medium text-[#16201B]">
                                {finding.stats?.windowDays || 60} days prior
                              </span>
                            </div>
                          </div>

                          {/* Comparable Transactions List */}
                          <div>
                            <div className="text-[11px] font-mono text-[#788780] mb-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {comparableTxs.length} Preceding Observations Used for Comparison:
                              </span>
                            </div>
                            {comparableTxs.length === 0 ? (
                              <p className="text-xs text-[#788780] italic">
                                No specific transaction IDs retrieved.
                              </p>
                            ) : (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {comparableTxs.map((tx) => (
                                  <div
                                    key={tx.id}
                                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="font-mono text-[10px] text-[#788780] shrink-0">
                                        {tx.date}
                                      </span>
                                      <span className="font-medium text-[#16201B] truncate">
                                        {tx.description}
                                      </span>
                                    </div>
                                    <span className="font-mono font-medium text-[#16201B] shrink-0 ml-2">
                                      {formatCurrency(tx.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
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
