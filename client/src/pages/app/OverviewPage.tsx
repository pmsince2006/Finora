import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  AlertTriangle,
  PiggyBank,
  ArrowRight,
  Plus,
  UploadCloud,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ShieldCheck,
  Receipt,
} from 'lucide-react'
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts'
import { useFinance } from '../../context/useFinance'
import { formatCurrency, formatPercent } from '../../lib/formatCurrency'

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E6DF] shadow-lg text-xs font-sans">
        <div className="font-mono text-[#62726A] mb-1.5 pb-1 border-b border-[#E6E6DF]">
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-[#35423B]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono font-medium text-[#16201B]">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    filteredTransactions,
    metrics,
    categoryBreakdown,
    trendData,
    recurringSummary,
    anomalySummary,
    savingsSummary,
    period,
    openAddTxModal,
    openImportModal,
  } = useFinance()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  // Slice recent 6 transactions for overview table
  const recentTransactions = filteredTransactions.slice(0, 6)



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Editorial Overview Sub-Banner */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6E6DF]/80 text-xs text-[#62726A]"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#153326] font-semibold tracking-wider">
            [FINORA LAB // CASE #4029]
          </span>
          <span className="text-[#D4D4CA]">•</span>
          <span>Subject: Alex Morrison (SWE Intern &amp; Graduate Student)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2D6A4F]" />
          <span className="font-mono text-[11px] text-[#2D6A4F]">
            ILLUSTRATIVE DEMO DATASET (INR ₹)
          </span>
        </div>
      </motion.div>

      {/* SECTION A: SUMMARY METRICS (4 Responsive Cards) */}
      <motion.section variants={cardVariants} aria-label="Summary Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Income */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs hover:border-[#D4D4CA] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
                Total Inflow
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#E3ECE8] text-[#1B4332] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-serif font-medium text-[#16201B] tracking-tight">
                {formatCurrency(metrics.totalIncome)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#2D6A4F] font-medium">
                <span className="font-mono">
                  {metrics.incomeCount} credit{metrics.incomeCount !== 1 ? 's' : ''} recorded
                </span>
              </div>
            </div>
          </div>

          {/* 2. Total Expenses */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs hover:border-[#D4D4CA] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
                Total Outflow
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#FDF1EF] text-[#B83A2E] flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-serif font-medium text-[#16201B] tracking-tight">
                {formatCurrency(metrics.totalExpenses)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#52796F] font-medium">
                <span className="font-mono">
                  {metrics.expenseCount} debit{metrics.expenseCount !== 1 ? 's' : ''} in window
                </span>
              </div>
            </div>
          </div>

          {/* 3. Net Cashflow */}
          <div
            className={`p-5 rounded-2xl border shadow-2xs transition-all ${
              metrics.netCashflow >= 0
                ? 'bg-[#F2F7F4] border-[#C2D3CC]'
                : 'bg-[#FDF1EF] border-[#F5C2BC]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#153326]">
                Net Cashflow
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  metrics.netCashflow >= 0
                    ? 'bg-[#E3ECE8] text-[#153326]'
                    : 'bg-[#F9D5D1] text-[#B83A2E]'
                }`}
              >
                {metrics.netCashflow >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-2xl lg:text-3xl font-serif font-medium tracking-tight ${
                  metrics.netCashflow >= 0 ? 'text-[#0E241B]' : 'text-[#B83A2E]'
                }`}
              >
                {formatCurrency(metrics.netCashflow, { showSign: true })}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[#35423B]">
                <span>Inflow minus eligible debits</span>
              </div>
            </div>
          </div>

          {/* 4. Potential Monthly Savings */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs hover:border-[#D4D4CA] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780] flex items-center gap-1">
                <span>Potential Savings</span>
                <span title="Calculated from verified lifestyle & recurring audit models" className="cursor-help">
                  <Info className="w-3 h-3 text-[#A2B0A9]" />
                </span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#FCF4EB] text-[#C97A2B] flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl lg:text-3xl font-serif font-medium text-[#16201B] tracking-tight">
                {formatCurrency(savingsSummary.totalPotentialMonthly ?? metrics.potentialMonthlySavings)}
                <span className="text-xs font-mono font-normal text-[#788780] ml-1">/mo</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[#2D6A4F] font-medium">
                <span className="font-mono">{savingsSummary.activeCount} active opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION B & C: SPENDING TREND CHART & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* B. Spending Trend Chart (7 cols on lg) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-7 bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E6E6DF] gap-2">
              <div>
                <h2 className="text-base font-serif font-medium text-[#16201B]">
                  Financial Flow &amp; Outflow Trend
                </h2>
                <p className="text-xs text-[#62726A] mt-0.5">
                  Comparison between incoming credits, outflows, and baseline expectations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#52796F] px-2 py-0.5 bg-[#F2F7F4] rounded border border-[#C2D3CC]">
                  Period: {period}
                </span>
              </div>
            </div>

            {/* Recharts Chart Area */}
            <div className="h-64 sm:h-72 w-full pt-4">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#788780"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E6E6DF' }}
                    />
                    <YAxis
                      stroke="#788780"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
                    />
                    <Bar
                      dataKey="income"
                      name="Inflow (Income)"
                      fill="#153326"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Outflow (Expenses)"
                      fill="#52796F"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Expected Baseline"
                      stroke="#C97A2B"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[#788780]">
                  <Layers className="w-8 h-8 text-[#C2D3CC] mb-2" />
                  <p>No transaction data available for the chosen window.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#F5F5F0] flex items-center justify-between text-[11px] text-[#788780]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#153326]" />
              <span>Canonical demo ledger data</span>
            </span>
            <span className="font-mono">Axes: INR (₹)</span>
          </div>
        </motion.div>

        {/* C. Category Spending Breakdown (5 cols on lg) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-5 bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E6DF]">
              <div>
                <h2 className="text-base font-serif font-medium text-[#16201B]">
                  Category Allocation
                </h2>
                <p className="text-xs text-[#62726A] mt-0.5">
                  Reconciled breakdown of debits for selected period.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#52796F] px-2 py-0.5 bg-[#E3ECE8] rounded">
                100% RECONCILED
              </span>
            </div>

            {/* Category Ranked Bars */}
            <div className="mt-4 space-y-3.5 max-h-68 overflow-y-auto pr-1">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((cat, idx) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-[#788780] w-4">
                          0{idx + 1}
                        </span>
                        <span className="font-medium text-[#16201B] truncate">
                          {cat.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#788780]">
                          ({cat.count} tx)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                        <span className="text-[#16201B] font-medium">
                          {formatCurrency(cat.amount)}
                        </span>
                        <span className="text-[#52796F] text-[11px] w-11 text-right">
                          {formatPercent(cat.percentage)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="h-1.5 w-full bg-[#F5F5F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1B4332] to-[#52796F] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[#788780]">
                  No expense categories present in this time window.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#F5F5F0] flex items-center justify-between text-[11px] text-[#788780]">
            <span>Total Debits:</span>
            <span className="font-mono font-medium text-[#16201B]">
              {formatCurrency(metrics.totalExpenses)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* SECTION D: RECENT TRANSACTIONS TABLE */}
      <motion.section variants={cardVariants} aria-label="Recent Transactions">
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E6E6DF] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#153326]" />
                <h2 className="text-base font-serif font-medium text-[#16201B]">
                  Recent Activity &amp; Forensics
                </h2>
              </div>
              <p className="text-xs text-[#62726A] mt-0.5">
                Inspect newest ledger records with status badges and category forensics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openAddTxModal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#153326] hover:text-[#1B4332] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
              <Link
                to="/app/transactions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E6E6DF] text-xs font-medium text-[#16201B] transition-colors"
              >
                <span>View Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E6DF] text-[11px] font-mono uppercase text-[#788780]">
                  <th className="py-3 px-3 font-medium">Description / Merchant</th>
                  <th className="py-3 px-3 font-medium">Category</th>
                  <th className="py-3 px-3 font-medium">Date</th>
                  <th className="py-3 px-3 font-medium">Type</th>
                  <th className="py-3 px-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F0]">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FBFBFA] transition-colors group cursor-default"
                  >
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#16201B]">{tx.description}</div>
                      {tx.notes && (
                        <div className="text-[11px] text-[#788780] font-normal truncate max-w-xs mt-0.5">
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#4B5952]">
                      <span className="px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#62726A] text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          tx.type === 'income'
                            ? 'bg-[#E3ECE8] text-[#153326]'
                            : 'bg-[#F5F5F0] text-[#4B5952]'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-[#2D6A4F]" />
                            <span>Inflow</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3 h-3 text-[#788780]" />
                            <span>Debit</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-sm">
                      <span
                        className={
                          tx.type === 'income' ? 'text-[#153326]' : 'text-[#16201B]'
                        }
                      >
                        {formatCurrency(tx.amount, {
                          showSign: tx.type === 'income',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* SECTION E: INTELLIGENCE SUMMARIES (3 Dedicated Navigation Cards) */}
      <motion.section variants={cardVariants} aria-label="Intelligence Summaries">
        <div className="mb-4">
          <span className="font-mono text-xs text-[#52796F] uppercase tracking-wider block">
            Specialized Engines
          </span>
          <h2 className="text-xl font-serif font-medium text-[#16201B]">
            Forensic Intelligence Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Recurring Payment Detective */}
          <Link
            to="/app/recurring"
            className="group p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] hover:border-[#52796F] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#E3ECE8] text-[#153326] flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F7F4] text-[#153326] border border-[#C2D3CC]">
                  {recurringSummary.candidateCount} ACTIVE CANDIDATES
                </span>
              </div>
              <h3 className="text-base font-serif font-medium text-[#16201B] mt-3 group-hover:text-[#1B4332] transition-colors">
                Recurring Payment Detective
              </h3>
              <p className="text-xs text-[#62726A] mt-1 line-clamp-2">
                Cadence-matched recurring subscriptions &amp; fixed obligations currently tracked in ledger.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="text-[11px] font-mono text-[#788780]">
                  Estimated Monthly Commitment
                </div>
                <div className="text-lg font-serif font-medium text-[#16201B] mt-0.5">
                  {formatCurrency(recurringSummary.monthlyCommitment)}
                  <span className="text-xs font-mono font-normal text-[#788780] ml-1">/mo</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F5F5F0] flex items-center justify-between text-xs font-medium text-[#153326]">
              <span>Audit Subscriptions</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 2. Spending Anomaly Radar */}
          <Link
            to="/app/investigations"
            className="group p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] hover:border-[#C97A2B] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FCF4EB] text-[#C97A2B] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCF4EB] text-[#C97A2B] border border-[#F3D7BD]">
                  {anomalySummary.reviewableCount} FLAGGED SPIKE
                </span>
              </div>
              <h3 className="text-base font-serif font-medium text-[#16201B] mt-3 group-hover:text-[#C97A2B] transition-colors">
                Spending Anomaly Radar
              </h3>
              <p className="text-xs text-[#62726A] mt-1 line-clamp-2">
                Statistical standard-deviation spikes and category variance requiring evidence review.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-[#FCF4EB]/50 border border-[#F3D7BD]">
                <div className="text-[11px] font-mono text-[#C97A2B]">
                  Unusual Discretionary Volume
                </div>
                <div className="text-lg font-serif font-medium text-[#16201B] mt-0.5">
                  {formatCurrency(anomalySummary.spikesTotal)}
                  <span className="text-xs font-mono font-normal text-[#788780] ml-1">flagged</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F5F5F0] flex items-center justify-between text-xs font-medium text-[#C97A2B]">
              <span>Inspect Anomalies</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 3. Savings Opportunity Lab */}
          <Link
            to="/app/savings"
            className="group p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] hover:border-[#2D6A4F] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#E3ECE8] text-[#153326] flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326] border border-[#C2D3CC]">
                  LAB READY
                </span>
              </div>
              <h3 className="text-base font-serif font-medium text-[#16201B] mt-3 group-hover:text-[#1B4332] transition-colors">
                Savings Opportunity Lab
              </h3>
              <p className="text-xs text-[#62726A] mt-1 line-clamp-2">
                Simulate targeted lifestyle trims and compound savings cushions before altering habits.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC]">
                <div className="text-[11px] font-mono text-[#2D6A4F]">
                  Top Opportunity: {savingsSummary.topOpportunity ? savingsSummary.topOpportunity.category : 'All clear'}
                </div>
                <div className="text-lg font-serif font-medium text-[#16201B] mt-0.5">
                  +{formatCurrency(savingsSummary.topOpportunity ? savingsSummary.topOpportunity.potentialMonthlySavings : 0)}
                  <span className="text-xs font-mono font-normal text-[#788780] ml-1">/mo</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F5F5F0] flex items-center justify-between text-xs font-medium text-[#153326]">
              <span>Open Simulation Lab</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </motion.section>

      {/* SECTION F: QUICK ACTIONS DOCK */}
      <motion.section variants={cardVariants} aria-label="Quick Actions">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F0] border border-[#E6E6DF] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#35423B]">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <div>
              <span className="font-semibold text-[#0E241B] block">Quick Forensic Operations</span>
              <span className="text-[11px] text-[#62726A]">
                Execute real-time ledger updates or launch focused module investigations.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={openAddTxModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[#153326] text-[#F2F7F4] hover:bg-[#1B4332] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={openImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-[#16201B] hover:bg-[#FBFBFA] transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#52796F]" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => navigate('/app/transactions')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-[#16201B] hover:bg-[#FBFBFA] transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-[#788780]" />
              <span>View Ledger</span>
            </button>
            <button
              onClick={() => navigate('/app/investigations')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-[#C97A2B] hover:bg-[#FBFBFA] transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#C97A2B]" />
              <span>Radar</span>
            </button>
            <button
              onClick={() => navigate('/app/savings')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-[#2D6A4F] hover:bg-[#FBFBFA] transition-colors"
            >
              <PiggyBank className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Savings Lab</span>
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
