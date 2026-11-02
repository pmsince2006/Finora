import { createContext } from 'react'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  undoAction?: () => void
  undoLabel?: string
  duration?: number
}

export interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void
  showUndoToast: (message: string, onUndo: () => void, undoLabel?: string, duration?: number) => void
  dismissToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)
