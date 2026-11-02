import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UploadCloud, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useFinance } from '../../context/useFinance'

export const ImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal } = useFinance()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeImportModal()
    }
    if (isImportModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isImportModalOpen, closeImportModal])

  return (
    <AnimatePresence>
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C120F]/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
          onClick={closeImportModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xl p-6 sm:p-7 text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4332] via-[#52796F] to-[#74968C]" />

            <button
              onClick={closeImportModal}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3ECE8] text-[#153326] text-[10px] font-mono font-medium mb-2">
                <FileSpreadsheet className="w-3 h-3 text-[#2D6A4F]" />
                <span>PHASE 03 ENGINE SPECIFICATION</span>
              </div>
              <h2 id="import-modal-title" className="text-xl font-serif font-medium text-[#16201B]">
                Statement & CSV Importer
              </h2>
              <p className="text-xs text-[#62726A] mt-1">
                Forensic transaction ingestion engine with automated column mapping.
              </p>
            </div>

            {/* Mock Drag & Drop Zone */}
            <div className="border-2 border-dashed border-[#C2D3CC] rounded-2xl p-6 text-center bg-[#FBFBFA] mb-5">
              <div className="w-12 h-12 rounded-full bg-[#E3ECE8] text-[#153326] flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6 text-[#2D6A4F]" />
              </div>
              <p className="text-xs font-medium text-[#16201B]">
                Drop CSV or Bank Statement (.csv, .tsv)
              </p>
              <p className="text-[11px] text-[#62726A] mt-1">
                Supports HDFC, ICICI, SBI, Axis, and standard Money Lover / Mint exports.
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-[#F5F5F0] text-[10px] font-mono text-[#52796F]">
                ENGINE ACTIVE IN PHASE 03
              </div>
            </div>

            {/* Honest Technical Status Notice */}
            <div className="space-y-2 mb-6 text-xs text-[#35423B]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Cloud Privacy:</strong> CSV files are parsed client-side in Web Workers without uploading unencrypted raw statements to third-party servers.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>
                  <strong>Smart Deduplication:</strong> Identifies transaction overlap across overlapping date exports.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#E6E6DF]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#52796F]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 02 interactive demo mode active</span>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="px-4 py-2 text-xs font-medium text-[#153326] bg-[#E3ECE8] hover:bg-[#D4D4CA] rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
