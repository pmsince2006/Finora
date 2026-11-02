import { createContext } from 'react'
import type {
  Transaction,
  PeriodFilter,
  SummaryMetrics,
  CategoryBreakdown,
  SpendingTrendPoint,
  RecurringSummary,
  AnomalySummary,
  SavingsSummary,
} from '../types/finance'

export interface FinanceContextType {
  transactions: Transaction[]
  period: PeriodFilter
  setPeriod: (period: PeriodFilter) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction
  editTransaction: (id: string, updated: Omit<Transaction, 'id'>) => boolean
  deleteTransaction: (id: string) => Transaction | null
  undoDelete: (tx: Transaction) => void
  importTransactions: (newTxs: Omit<Transaction, 'id'>[]) => { importedCount: number }
  resetToDemo: () => void
  filteredTransactions: Transaction[]
  metrics: SummaryMetrics
  categoryBreakdown: CategoryBreakdown[]
  trendData: SpendingTrendPoint[]
  recurringSummary: RecurringSummary
  anomalySummary: AnomalySummary
  savingsSummary: SavingsSummary
  isAddTxModalOpen: boolean
  editingTransaction: Transaction | null
  openAddTxModal: () => void
  openEditTxModal: (tx: Transaction) => void
  closeAddTxModal: () => void
  isImportModalOpen: boolean
  openImportModal: () => void
  closeImportModal: () => void
  isUsingFallback: boolean
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined)
