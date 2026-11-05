import React, { useState } from 'react'
import {
  RotateCcw,
  CheckCircle2,
  Database,
  AlertTriangle,
  X,
} from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { useToast } from '../../context/useToast'
import { STORAGE_KEY } from '../../lib/transactionStorage'
import type { PeriodFilter } from '../../types/finance'

export const SettingsPage: React.FC = () => {
  const { period, setPeriod, resetToDemo, transactions } = useFinance()
  const { showToast } = useToast()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleConfirmReset = () => {
    resetToDemo()
    setIsConfirmOpen(false)
    setResetSuccess(true)
    showToast('Ledger successfully restored to default demo dataset.', 'success')
    setTimeout(() => setResetSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Honest Local-First Notice */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <Database className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0E241B]">
            Browser-Local Storage Model
          </strong>
          <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
            Finora saves transactions directly inside your browser cache under the namespaced key{' '}
            <code className="font-mono bg-[#E3ECE8] px-1 py-0.5 rounded text-[#153326]">{STORAGE_KEY}</code>.
            Your transactions persist across tab reloads and browser restarts on this machine. No financial data, account statements, or passwords leave your browser.
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
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
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

        {/* 3. Demo Dataset & Reset Management */}
        <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[#16201B]">
              Reset to Demo Data
            </h2>
            <p className="text-xs text-[#62726A] mt-0.5">
              Replaces all locally saved transactions with the original immutable Case #4029 student demo dataset.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#62726A]">Currently loaded in ledger:</span>{' '}
              <strong className="font-mono text-[#16201B]">{transactions.length}</strong> transactions
            </div>

            <button
              onClick={() => setIsConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E6E6DF] text-[#16201B] text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#52796F]" />
              <span>Reset to Demo Data</span>
            </button>
          </div>

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-[#E3ECE8] text-[#153326] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>The Money Ledger has been restored to the original 86 seed transactions.</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C120F]/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xl p-6 text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B83A2E] via-[#C97A2B] to-[#F59E0B]" />

            <button
              onClick={() => setIsConfirmOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0]"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FCF4EB] text-[#C97A2B] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 id="confirm-reset-title" className="text-base font-serif font-medium text-[#16201B]">
                  Restore Demo Dataset?
                </h2>
                <p className="text-xs text-[#62726A] mt-1">
                  This action will discard any manually added or imported transactions and restore the standard Case #4029 student demo data in this browser.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E6E6DF] text-xs font-medium text-[#62726A] hover:bg-[#F5F5F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm &amp; Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
