import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import type { PeriodFilter } from '../../types/finance'

export const SettingsPage: React.FC = () => {
  const { period, setPeriod, resetToDemo } = useFinance()
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleReset = () => {
    resetToDemo()
    setResetSuccess(true)
    setTimeout(() => setResetSuccess(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Link & Header */}
      <div className="pb-4 border-b border-[#E6E6DF]">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52796F] hover:text-[#153326] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-medium text-[#16201B]">
            Application Preferences
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
            SESSION LOCAL
          </span>
        </div>
        <p className="text-xs text-[#62726A] mt-0.5">
          Configure interface behavior, view intervals, and manage in-memory preview state.
        </p>
      </div>

      {/* Honest Boundary Notice */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0E241B]">
            Demo Scope Notice
          </strong>
          <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
            Only functional client-side preferences are displayed here. Cloud-synced user account settings, 2FA security controls, and encrypted database exports will be added once backend authentication is established.
          </p>
        </div>
      </div>

      {/* Preference Sections */}
      <div className="space-y-5">
        {/* 1. Default Reporting Period */}
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#16201B]">
                Active Reporting Window
              </h2>
              <p className="text-xs text-[#62726A] mt-0.5">
                Default time horizon applied to overview metrics and trend charts.
              </p>
            </div>
            <span className="text-xs font-mono text-[#52796F] bg-[#F2F7F4] px-2 py-1 rounded">
              Current: {period}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {[
              { val: '30D', label: 'Last 30 Days' },
              { val: '60D', label: 'Last 60 Days' },
              { val: '90D', label: 'Last 90 Days' },
              { val: 'THIS_MONTH', label: 'This Month' },
              { val: 'ALL', label: 'All History' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setPeriod(item.val as PeriodFilter)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                  period === item.val
                    ? 'bg-[#153326] text-[#F2F7F4] border-[#153326] shadow-xs font-semibold'
                    : 'bg-[#FBFBFA] border-[#E6E6DF] text-[#35423B] hover:bg-[#F5F5F0]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Currency & Locale */}
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-[#16201B]">
            Currency &amp; Regional Formatting
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
            <div>
              <div className="text-xs font-medium text-[#16201B]">Base Currency</div>
              <div className="text-[11px] text-[#62726A] mt-0.5">
                Standard format: Indian Rupee (₹ INR) with en-IN number groupings (lakhs/crores).
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#E3ECE8] text-[#153326] font-mono text-xs font-medium self-start sm:self-auto">
              ₹ INR (Standard)
            </div>
          </div>
        </div>

        {/* 3. Demo Dataset Management */}
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-[#16201B]">
            In-Memory Ledger Reset
          </h2>
          <p className="text-xs text-[#62726A]">
            If you have added manual transactions or adjusted variables during your session, you can instantly revert back to the canonical Case #4029 demo dataset.
          </p>

          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E6E6DF] text-[#16201B] text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#52796F]" />
              <span>Reset Ledger to Default</span>
            </button>

            {resetSuccess && (
              <span className="text-xs text-[#2D6A4F] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ledger reset to baseline!</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
