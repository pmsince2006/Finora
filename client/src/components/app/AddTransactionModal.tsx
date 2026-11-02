import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, AlertCircle, Info, Sparkles } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import type { TransactionType } from '../../types/finance'

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries & Staples',
  'Housing & Rent',
  'Digital Services',
  'Education & Textbooks',
  'Transportation',
  'Healthcare & Fitness',
  'Utilities & Phone',
  'Shopping & Discretionary',
]

const INCOME_CATEGORIES = [
  'Salary & Stipend',
  'Freelance & Gigs',
  'Teaching & Research',
  'Refunds & Reimbursements',
  'Other Income',
]

export const AddTransactionModal: React.FC = () => {
  const { isAddTxModalOpen, closeAddTxModal, addTransaction } = useFinance()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [date, setDate] = useState('2026-04-28')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState(false)

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  }

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddTxModal()
    }
    if (isAddTxModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAddTxModalOpen, closeAddTxModal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanDesc = description.trim()
    if (!cleanDesc) {
      setError('Please provide a merchant or description.')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.')
      return
    }

    if (!date) {
      setError('Please choose a valid transaction date.')
      return
    }

    // Add to in-memory store
    addTransaction({
      description: cleanDesc,
      amount: Math.round(numAmount * 100) / 100,
      type,
      category,
      date,
      notes: notes.trim() || undefined,
      account: 'HDFC Student Checking',
      status: 'regular',
    })

    setSuccessNotice(true)
    setTimeout(() => {
      setSuccessNotice(false)
      setDescription('')
      setAmount('')
      setNotes('')
      closeAddTxModal()
    }, 600)
  }

  return (
    <AnimatePresence>
      {isAddTxModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C120F]/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-tx-modal-title"
          onClick={closeAddTxModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xl p-6 sm:p-7 text-left overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#74968C]" />

            {/* Close Button */}
            <button
              onClick={closeAddTxModal}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3ECE8] text-[#153326] text-[10px] font-mono font-medium mb-2">
                <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
                <span>IN-MEMORY DEMO LEDGER</span>
              </div>
              <h2 id="add-tx-modal-title" className="text-xl font-serif font-medium text-[#16201B]">
                Record Transaction
              </h2>
              <p className="text-xs text-[#62726A] mt-1">
                Enter an outflow or inflow to update dashboard metrics and forensic breakdown in real time.
              </p>
            </div>

            {/* Informational Banner on In-Memory Scope */}
            <div className="mb-4 p-3 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC] text-[11px] text-[#1B4332] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-[#0E241B]">In-memory session change:</strong> This entry immediately re-calculates net cashflow, category allocations, and charts. Persistent database storage will be integrated in Phase 03.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FDF1EF] border border-[#F5C2BC] text-xs text-[#B83A2E] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className="mb-4 p-3 rounded-xl bg-[#E3ECE8] border border-[#9DB4AC] text-xs text-[#153326] flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                <span>Transaction recorded! Updating live charts and balances...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type Segmented Toggle */}
              <div>
                <label className="block text-xs font-medium text-[#35423B] mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F5F5F0] border border-[#E6E6DF]">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all ${
                      type === 'expense'
                        ? 'bg-[#FFFFFF] text-[#0E241B] shadow-xs font-semibold'
                        : 'text-[#62726A] hover:text-[#16201B]'
                    }`}
                  >
                    Expense (Outflow)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all ${
                      type === 'income'
                        ? 'bg-[#153326] text-[#F2F7F4] shadow-xs font-semibold'
                        : 'text-[#62726A] hover:text-[#16201B]'
                    }`}
                  >
                    Income (Inflow)
                  </button>
                </div>
              </div>

              {/* Merchant / Description */}
              <div>
                <label className="block text-xs font-medium text-[#35423B] mb-1">
                  Merchant or Description <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'expense' ? 'e.g. Blue Tokai Coffee, Blinkit, Bookshop' : 'e.g. Freelance Milestone, Fellowship, Stipend'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                />
              </div>

              {/* Amount and Date (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#35423B] mb-1">
                    Amount (₹ INR) <span className="text-[#B83A2E]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-mono font-medium text-[#788780]">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#35423B] mb-1">
                    Date <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-medium text-[#35423B] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                >
                  {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-medium text-[#35423B] mb-1">
                  Forensic Notes <span className="text-[#788780] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Context for anomaly detector or spending audits"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAddTxModal}
                  className="px-4 py-2.5 text-xs font-medium text-[#4B5952] hover:text-[#16201B] rounded-xl hover:bg-[#F5F5F0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Transaction</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
