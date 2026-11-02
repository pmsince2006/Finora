import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { formatCurrency } from '../../lib/formatCurrency'

interface DeleteConfirmModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
  onConfirm: (tx: Transaction) => void
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !transaction) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C120F]/45 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xl p-6 text-left overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Danger accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B83A2E] via-[#C97A2B] to-[#E57373]" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FCF0EF] text-[#B83A2E] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-dialog-title" className="text-base font-serif font-medium text-[#16201B]">
                Delete Transaction?
              </h2>
              <p className="text-xs text-[#62726A] mt-1">
                Are you sure you want to remove this record from your Money Ledger?
              </p>
            </div>
          </div>

          {/* Record Details Summary */}
          <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] mb-5 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#62726A]">Merchant / Item:</span>
              <span className="font-medium text-[#16201B]">{transaction.description}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#62726A]">Date:</span>
              <span className="font-mono text-[#16201B]">{transaction.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#62726A]">Amount:</span>
              <span className="font-mono font-semibold text-[#16201B]">
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#62726A]">Category:</span>
              <span className="text-[#4B5952]">{transaction.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E6E6DF] text-xs font-medium text-[#62726A] hover:bg-[#F5F5F0] hover:text-[#16201B] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(transaction)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B83A2E] text-[#FFFFFF] text-xs font-medium hover:bg-[#992E24] active:scale-98 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Transaction</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
