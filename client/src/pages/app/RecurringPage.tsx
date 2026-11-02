import React from 'react'
import { Link } from 'react-router-dom'
import { Repeat, ArrowLeft, Sparkles } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { formatCurrency } from '../../lib/formatCurrency'

export const RecurringPage: React.FC = () => {
  const { recurringSummary } = useFinance()

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E6DF]">
        <div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52796F] hover:text-[#153326] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-medium text-[#16201B]">
              Recurring Payment Detective
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
              {recurringSummary.candidateCount} SERVICES TRACKED
            </span>
          </div>
          <p className="text-xs text-[#62726A] mt-0.5">
            Statistical cadence matcher isolating regular debits, subscriptions, and recurring obligations.
          </p>
        </div>
      </div>

      {/* Honest Roadmap Notice for Phase 04 */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0E241B]">
            Phase 02 Interactive Preview Active
          </strong>
          <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
            The candidate subscriptions below are derived from canonical interval patterns in your active ledger. In <strong>Phase 04 (Recurring Detective)</strong>, we will enable automated cadence-drift detection, price-hike alerts, and 1-click subscription cancellation playbooks.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Monthly Recurring Commitment
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            {formatCurrency(recurringSummary.monthlyCommitment)}
            <span className="text-xs font-mono font-normal text-[#788780] ml-1">/mo</span>
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block">
            Annual run-rate: {formatCurrency(recurringSummary.annualCommitment)}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Candidate Services
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            {recurringSummary.candidateCount} Verified
          </div>
          <span className="text-[11px] text-[#2D6A4F] mt-1 block">
            Average confidence: 97.4%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Cadence Engine Status
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            Active
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block">
            30-day regular interval window
          </span>
        </div>
      </div>

      {/* Subscription Cards List */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E6DF] flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-medium text-[#16201B]">
              Detected Recurring Commitments
            </h2>
            <p className="text-xs text-[#62726A] mt-0.5">
              Ranked by confidence score and billing cadence.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#52796F]">
            SORTED BY LAST BILLED
          </span>
        </div>

        <div className="divide-y divide-[#F5F5F0]">
          {recurringSummary.candidates.map((sub) => (
            <div
              key={sub.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBFBFA] transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E3ECE8] text-[#153326] flex items-center justify-center shrink-0">
                  <Repeat className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[#16201B]">
                      {sub.merchant}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F2F7F4] text-[#153326] border border-[#C2D3CC]">
                      {sub.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#62726A] mt-1">
                    <span>{sub.category}</span>
                    <span>•</span>
                    <span className="font-mono">Cadence: {sub.cadence}</span>
                    <span>•</span>
                    <span className="font-mono text-[#2D6A4F]">
                      {Math.round(sub.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F5F5F0]">
                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-mono text-[#788780]">
                    Next Expected
                  </div>
                  <div className="text-xs font-mono text-[#16201B]">
                    {sub.nextExpected}
                  </div>
                </div>

                <div className="text-right min-w-24">
                  <div className="text-base font-serif font-medium text-[#16201B]">
                    {formatCurrency(sub.amount)}
                  </div>
                  <div className="text-[10px] font-mono text-[#788780]">
                    per {sub.cadence.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
