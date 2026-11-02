import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { formatCurrency } from '../../lib/formatCurrency'

export const InvestigationsPage: React.FC = () => {
  const { anomalySummary } = useFinance()

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
              Spending Anomaly Radar
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCF4EB] text-[#C97A2B] border border-[#F3D7BD]">
              {anomalySummary.reviewableCount} ACTIVE FINDINGS
            </span>
          </div>
          <p className="text-xs text-[#62726A] mt-0.5">
            Mathematical deviation models detecting outsized purchases and statistical outliers.
          </p>
        </div>
      </div>

      {/* Honest Roadmap Notice for Phase 04 */}
      <div className="p-4 rounded-2xl bg-[#FCF4EB]/70 border border-[#F3D7BD] text-xs text-[#C97A2B] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#C97A2B] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#16201B]">
            Phase 02 Interactive Preview Active
          </strong>
          <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
            The anomalies below represent statistical spikes isolated from category baselines in the demo ledger. In <strong>Phase 04 (Anomaly Radar Engine)</strong>, we will implement dynamic rolling 30/60/90-day z-score thresholds, sensitivity sliders, and false-positive dismissal controls.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Flagged Outlier Volume
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            {formatCurrency(anomalySummary.spikesTotal)}
          </div>
          <span className="text-[11px] text-[#C97A2B] mt-1 block">
            Across {anomalySummary.reviewableCount} flagged transactions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Highest Spike Ratio
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            4.1x Normal
          </div>
          <span className="text-[11px] text-[#52796F] mt-1 block">
            Education &amp; Textbook Capstone
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#788780]">
            Forensic Algorithm
          </span>
          <div className="text-2xl font-serif font-medium text-[#16201B] mt-1.5">
            Moving Baseline
          </div>
          <span className="text-[11px] text-[#2D6A4F] mt-1 block">
            Standard deviation filter &gt; 3.0σ
          </span>
        </div>
      </div>

      {/* Anomaly Cases List */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E6DF] flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-medium text-[#16201B]">
              Active Outlier Investigation Files
            </h2>
            <p className="text-xs text-[#62726A] mt-0.5">
              Review flagged items to verify whether purchases were anticipated or unauthorized.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#52796F]">
            SEVERITY RANKED
          </span>
        </div>

        <div className="divide-y divide-[#F5F5F0]">
          {anomalySummary.findings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FBFBFA] transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    finding.severity === 'high'
                      ? 'bg-[#FDF1EF] text-[#B83A2E]'
                      : 'bg-[#FCF4EB] text-[#C97A2B]'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[#16201B]">
                      {finding.merchant}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        finding.severity === 'high'
                          ? 'bg-[#FDF1EF] text-[#B83A2E]'
                          : 'bg-[#FCF4EB] text-[#C97A2B]'
                      }`}
                    >
                      {finding.severity.toUpperCase()} SEVERITY
                    </span>
                  </div>

                  <div className="text-xs text-[#62726A] mt-1">
                    <span>{finding.category}</span>
                    <span className="mx-2">•</span>
                    <span className="font-mono text-[#16201B]">
                      {finding.ratio}x category baseline
                    </span>
                    <span className="mx-2">•</span>
                    <span className="font-mono">{finding.date}</span>
                  </div>

                  <div className="mt-2 text-xs text-[#35423B] bg-[#F5F5F0] px-3 py-1.5 rounded-lg inline-block">
                    <strong>Forensic Evidence:</strong> {finding.reason}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F5F5F0]">
                <div className="text-left lg:text-right">
                  <div className="text-[11px] font-mono text-[#788780]">
                    Expected Baseline
                  </div>
                  <div className="text-xs font-mono text-[#62726A]">
                    {formatCurrency(finding.baselineAmount)}
                  </div>
                </div>

                <div className="text-right min-w-28">
                  <div className="text-[11px] font-mono text-[#788780]">
                    Recorded Outflow
                  </div>
                  <div className="text-lg font-serif font-medium text-[#B83A2E]">
                    {formatCurrency(finding.amount)}
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
