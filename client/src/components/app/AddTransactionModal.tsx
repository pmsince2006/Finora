import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Edit3, AlertCircle, Sparkles } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { useToast } from '../../context/useToast'
import type { Transaction, TransactionType } from '../../types/finance'

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

const ACCOUNT_OPTIONS = [
  'HDFC Student Checking',
  'ICICI Salary Account',
  'SBI Savings Account',
  'UPI Wallet / GPay',
  'Cash on Hand',
]

interface AddTransactionFormProps {
  editingTransaction: Transaction | null
  onClose: () => void
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ editingTransaction, onClose }) => {
  const { addTransaction, editTransaction } = useFinance()
  const { showToast } = useToast()

  const isEditMode = Boolean(editingTransaction)

  // Direct state initialization from props (avoids setState in effect)
  const [description, setDescription] = useState(editingTransaction?.description || '')
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : '')
  const [type, setType] = useState<TransactionType>(editingTransaction?.type || 'expense')
  const [category, setCategory] = useState(
    editingTransaction?.category || (editingTransaction?.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  )
  const [date, setDate] = useState(() =>
    editingTransaction?.date ? editingTransaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [account, setAccount] = useState(editingTransaction?.account || ACCOUNT_OPTIONS[0])
  const [notes, setNotes] = useState(editingTransaction?.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  }

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)

    const cleanDesc = description.trim()
    if (!cleanDesc) {
      setError('Please provide a merchant name or transaction description.')
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

    setIsSubmitting(true)

    const payload = {
      description: cleanDesc,
      amount: Math.round(numAmount * 100) / 100,
      type,
      category,
      date,
      account,
      notes: notes.trim() || undefined,
      status: 'regular' as const,
    }

    if (isEditMode && editingTransaction) {
      editTransaction(editingTransaction.id, {
        ...editingTransaction,
        ...payload,
      })
      showToast(`Updated "${cleanDesc}" (${type === 'income' ? '+' : '-'}₹${payload.amount})`, 'success')
    } else {
      addTransaction(payload)
      showToast(`Recorded "${cleanDesc}" (${type === 'income' ? '+' : '-'}₹${payload.amount})`, 'success')
    }

    setIsSubmitting(false)
    onClose()
  }

  const categoryOptions = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C120F]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xl p-6 sm:p-7 text-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4332] via-[#52796F] to-[#74968C]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3ECE8] text-[#153326] text-[10px] font-mono font-medium mb-2">
            <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
            <span>{isEditMode ? 'EDIT LEDGER ENTRY' : 'MONEY LEDGER RECORD'}</span>
          </div>
          <h2 id="modal-title" className="text-xl font-serif font-medium text-[#16201B]">
            {isEditMode ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <p className="text-xs text-[#62726A] mt-1">
            {isEditMode
              ? 'Update transaction details while preserving its audit history.'
              : 'Add a new financial transaction directly to your persistent Money Ledger.'}
          </p>
        </div>

        {/* Validation Error Banner */}
        {error && (
          <div
            className="mb-4 p-3 rounded-xl bg-[#FCF4EB] border border-[#F0D5BA] text-xs text-[#C97A2B] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Switcher: Income vs Expense */}
          <div>
            <label className="block text-xs font-medium text-[#35423B] mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F0] rounded-xl border border-[#E6E6DF]">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-[#FFFFFF] text-[#16201B] shadow-xs font-semibold'
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
            <label htmlFor="description" className="block text-xs font-medium text-[#35423B] mb-1">
              Merchant or Description *
            </label>
            <input
              id="description"
              type="text"
              required
              placeholder="e.g. Swiggy, Netflix, Internship Stipend"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
            />
          </div>

          {/* Amount and Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="amount" className="block text-xs font-medium text-[#35423B] mb-1">
                Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[#788780]">₹</span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-xs font-medium text-[#35423B] mb-1">
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
              />
            </div>
          </div>

          {/* Category and Account in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-[#35423B] mb-1">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="account" className="block text-xs font-medium text-[#35423B] mb-1">
                Account / Method
              </label>
              <select
                id="account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
              >
                {ACCOUNT_OPTIONS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-medium text-[#35423B] mb-1">
              Notes (Optional)
            </label>
            <input
              id="notes"
              type="text"
              placeholder="e.g. Split with room partner, campus sprint project"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#E6E6DF]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#E6E6DF] text-xs font-medium text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isEditMode ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export const AddTransactionModal: React.FC = () => {
  const { isAddTxModalOpen, closeAddTxModal, editingTransaction } = useFinance()

  return (
    <AnimatePresence>
      {isAddTxModalOpen && (
        <AddTransactionForm
          key={editingTransaction ? editingTransaction.id : 'create-new'}
          editingTransaction={editingTransaction}
          onClose={closeAddTxModal}
        />
      )}
    </AnimatePresence>
  )
}
