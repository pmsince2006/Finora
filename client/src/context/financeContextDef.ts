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
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  resetToDemo: () => void
  filteredTransactions: Transaction[]
  metrics: SummaryMetrics
  categoryBreakdown: CategoryBreakdown[]
  trendData: SpendingTrendPoint[]
  recurringSummary: RecurringSummary
  anomalySummary: AnomalySummary
  savingsSummary: SavingsSummary
  isAddTxModalOpen: boolean
  openAddTxModal: () => void
  closeAddTxModal: () => void
  isImportModalOpen: boolean
  openImportModal: () => void
  closeImportModal: () => void
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined)
