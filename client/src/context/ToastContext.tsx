import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react'
import { ToastContext, type ToastItem } from './toastContextDef'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 4500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const item: ToastItem = { id, message, type, duration }
      setToasts((prev) => [...prev, item])

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id)
        }, duration)
      }
    },
    [dismissToast]
  )

  const showUndoToast = useCallback(
    (message: string, onUndo: () => void, undoLabel = 'Undo', duration = 6000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const item: ToastItem = {
        id,
        message,
        type: 'info',
        undoAction: () => {
          onUndo()
          dismissToast(id)
        },
        undoLabel,
        duration,
      }
      setToasts((prev) => [...prev, item])

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id)
        }, duration)
      }
    },
    [dismissToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, showUndoToast, dismissToast }}>
      {children}

      {/* Floating Accessible Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#153326] text-[#F2F7F4] border border-[#23533E] shadow-xl text-xs"
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#4EAC85] shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#E57373] shrink-0" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-[#9DB4AC] shrink-0" />}
                <span className="font-medium text-[#EAEFEA] leading-tight">{toast.message}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {toast.undoAction && (
                  <button
                    onClick={toast.undoAction}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#23533E] hover:bg-[#2D6A4F] text-[#4EAC85] hover:text-[#FFFFFF] text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{toast.undoLabel}</span>
                  </button>
                )}
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded text-[#9DB4AC] hover:text-[#FFFFFF] transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
