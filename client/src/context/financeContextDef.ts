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
import type { RecurringAnalysisResult } from '../lib/recurringDetection'
import type { AnomalyAnalysisResult } from '../lib/anomalyDetection'
import type { SavingsAnalysisResult } from '../lib/savingsDetection'
import type { SavingsOpportunity } from '../types/finance'

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
  recurringAnalysis: RecurringAnalysisResult
  confirmRecurringCandidate: (candidateKey: string) => void
  dismissRecurringCandidate: (candidateKey: string) => void
  reinstateRecurringCandidate: (candidateKey: string) => void
  resetRecurringReviews: () => void
  anomalySummary: AnomalySummary
  anomalyAnalysis: AnomalyAnalysisResult
  reviewAnomalyFinding: (findingKey: string) => void
  dismissAnomalyFinding: (findingKey: string) => void
  reinstateAnomalyFinding: (findingKey: string) => void
  resetAnomalyReviews: () => void
  savingsSummary: SavingsSummary
  savingsAnalysis: SavingsAnalysisResult
  savingsOpportunities: SavingsOpportunity[]
  saveSavingsOpportunity: (opportunityKey: string) => void
  planSavingsOpportunity: (opportunityKey: string, customTarget?: number) => void
  completeSavingsOpportunity: (opportunityKey: string) => void
  dismissSavingsOpportunity: (opportunityKey: string) => void
  reinstateSavingsOpportunity: (opportunityKey: string) => void
  resetSavingsReviews: () => void
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
