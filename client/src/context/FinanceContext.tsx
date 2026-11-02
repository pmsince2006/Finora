import React, { useState, useMemo, useCallback } from 'react'
import type { Transaction, PeriodFilter } from '../types/finance'
import {
  filterTransactionsByPeriod,
  calculateSummaryMetrics,
  calculateCategoryBreakdown,
  calculateSpendingTrend,
  calculateSavingsSummary,
} from '../lib/financeCalculations'
import {
  loadTransactionsFromStorage,
  saveTransactionsToStorage,
  getFreshDemoTransactions,
} from '../lib/transactionStorage'
import {
  detectRecurringPayments,
  type RecurringAnalysisResult,
} from '../lib/recurringDetection'
import {
  loadRecurringReviews,
  saveRecurringReview,
  removeRecurringReview,
  clearRecurringReviews,
  type RecurringReviewRecord,
} from '../lib/recurringStorage'
import {
  detectSpendingAnomalies,
  type AnomalyAnalysisResult,
} from '../lib/anomalyDetection'
import {
  loadAnomalyReviews,
  saveAnomalyReview,
  removeAnomalyReview,
  clearAnomalyReviews,
  type AnomalyReviewRecord,
} from '../lib/anomalyStorage'
import { FinanceContext } from './financeContextDef'
import type { FinanceContextType } from './financeContextDef'

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initially from localStorage with safe fallback to demo data
  const [initialStorageState] = useState(() => loadTransactionsFromStorage())
  const [transactions, setTransactions] = useState<Transaction[]>(initialStorageState.transactions)
  const [period, setPeriod] = useState<PeriodFilter>('30D')
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Recurring Reviews state initialized from localStorage
  const [recurringReviews, setRecurringReviews] = useState<Record<string, RecurringReviewRecord>>(() =>
    loadRecurringReviews()
  )

  // Anomaly Reviews state initialized from localStorage
  const [anomalyReviews, setAnomalyReviews] = useState<Record<string, AnomalyReviewRecord>>(() =>
    loadAnomalyReviews()
  )

  // 1. CREATE Transaction
  const addTransaction = useCallback((newTx: Omit<Transaction, 'id'>): Transaction => {
    const created: Transaction = {
      ...newTx,
      id: `tx-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }
    setTransactions((prev) => {
      const next = [created, ...prev]
      saveTransactionsToStorage(next)
      return next
    })
    return created
  }, [])

  // 2. EDIT Transaction
  const editTransaction = useCallback((id: string, updated: Omit<Transaction, 'id'>): boolean => {
    let success = false
    setTransactions((prev) => {
      const idx = prev.findIndex((t) => t.id === id)
      if (idx === -1) return prev

      const next = [...prev]
      next[idx] = {
        ...updated,
        id, // Preserve original stable ID
      }
      saveTransactionsToStorage(next)
      success = true
      return next
    })
    return success
  }, [])

  // 3. DELETE Transaction
  const deleteTransaction = useCallback((id: string): Transaction | null => {
    let deleted: Transaction | null = null
    setTransactions((prev) => {
      const item = prev.find((t) => t.id === id)
      if (!item) return prev
      deleted = item

      const next = prev.filter((t) => t.id !== id)
      saveTransactionsToStorage(next)
      return next
    })
    return deleted
  }, [])

  // 4. UNDO DELETE
  const undoDelete = useCallback((restoredTx: Transaction) => {
    setTransactions((prev) => {
      // Avoid inserting duplicate if already present
      if (prev.some((t) => t.id === restoredTx.id)) return prev
      const next = [restoredTx, ...prev]
      saveTransactionsToStorage(next)
      return next
    })
  }, [])

  // 5. BATCH IMPORT Transactions
  const importTransactions = useCallback((newTxs: Omit<Transaction, 'id'>[]): { importedCount: number } => {
    if (newTxs.length === 0) return { importedCount: 0 }

    const createdList: Transaction[] = newTxs.map((tx, idx) => ({
      ...tx,
      id: `tx-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    }))

    setTransactions((prev) => {
      const next = [...createdList, ...prev]
      saveTransactionsToStorage(next)
      return next
    })

    return { importedCount: createdList.length }
  }, [])

  // 6. RECURRING CANDIDATE REVIEWS
  const confirmRecurringCandidate = useCallback((candidateKey: string) => {
    const record: RecurringReviewRecord = {
      candidateKey,
      status: 'confirmed',
      reviewedAt: new Date().toISOString(),
    }
    saveRecurringReview(record)
    setRecurringReviews((prev) => ({ ...prev, [candidateKey]: record }))
  }, [])

  const dismissRecurringCandidate = useCallback((candidateKey: string) => {
    const record: RecurringReviewRecord = {
      candidateKey,
      status: 'dismissed',
      reviewedAt: new Date().toISOString(),
    }
    saveRecurringReview(record)
    setRecurringReviews((prev) => ({ ...prev, [candidateKey]: record }))
  }, [])

  const reinstateRecurringCandidate = useCallback((candidateKey: string) => {
    removeRecurringReview(candidateKey)
    setRecurringReviews((prev) => {
      const next = { ...prev }
      delete next[candidateKey]
      return next
    })
  }, [])

  const resetRecurringReviews = useCallback(() => {
    clearRecurringReviews()
    setRecurringReviews({})
  }, [])

  // 7. SPENDING ANOMALY REVIEWS
  const reviewAnomalyFinding = useCallback((findingKey: string) => {
    const record: AnomalyReviewRecord = {
      findingKey,
      transactionId: findingKey.replace(/^anom-/, '').replace(/-[^-]+$/, ''),
      status: 'reviewed',
      reviewedAt: new Date().toISOString(),
    }
    saveAnomalyReview(record)
    setAnomalyReviews((prev) => ({ ...prev, [findingKey]: record }))
  }, [])

  const dismissAnomalyFinding = useCallback((findingKey: string) => {
    const record: AnomalyReviewRecord = {
      findingKey,
      transactionId: findingKey.replace(/^anom-/, '').replace(/-[^-]+$/, ''),
      status: 'dismissed',
      reviewedAt: new Date().toISOString(),
    }
    saveAnomalyReview(record)
    setAnomalyReviews((prev) => ({ ...prev, [findingKey]: record }))
  }, [])

  const reinstateAnomalyFinding = useCallback((findingKey: string) => {
    removeAnomalyReview(findingKey)
    setAnomalyReviews((prev) => {
      const next = { ...prev }
      delete next[findingKey]
      return next
    })
  }, [])

  const resetAnomalyReviews = useCallback(() => {
    clearAnomalyReviews()
    setAnomalyReviews({})
  }, [])

  // 8. RESET to Demo Dataset
  const resetToDemo = useCallback(() => {
    const fresh = getFreshDemoTransactions()
    setTransactions(fresh)
    saveTransactionsToStorage(fresh)
    clearRecurringReviews()
    setRecurringReviews({})
    clearAnomalyReviews()
    setAnomalyReviews({})
  }, [])

  // Modal helpers
  const openAddTxModal = useCallback(() => {
    setEditingTransaction(null)
    setIsAddTxModalOpen(true)
  }, [])

  const openEditTxModal = useCallback((tx: Transaction) => {
    setEditingTransaction(tx)
    setIsAddTxModalOpen(true)
  }, [])

  const closeAddTxModal = useCallback(() => {
    setIsAddTxModalOpen(false)
    setEditingTransaction(null)
  }, [])

  // Derive filtered transactions and analytics deterministically from canonical state
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, period)
  }, [transactions, period])

  const metrics = useMemo(() => {
    return calculateSummaryMetrics(filteredTransactions)
  }, [filteredTransactions])

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions)
  }, [filteredTransactions])

  const trendData = useMemo(() => {
    return calculateSpendingTrend(filteredTransactions, period)
  }, [filteredTransactions, period])

  // Pure deterministic Recurring Payment Detective engine
  const recurringAnalysis: RecurringAnalysisResult = useMemo(() => {
    return detectRecurringPayments(transactions, recurringReviews)
  }, [transactions, recurringReviews])

  const recurringSummary = recurringAnalysis.summary

  // Pure deterministic Spending Anomaly Radar engine
  const anomalyAnalysis: AnomalyAnalysisResult = useMemo(() => {
    return detectSpendingAnomalies(transactions, anomalyReviews)
  }, [transactions, anomalyReviews])

  const anomalySummary = anomalyAnalysis.summary

  // Synchronized savings summary
  const savingsSummary = useMemo(() => {
    return calculateSavingsSummary(transactions)
  }, [transactions])

  const value: FinanceContextType = {
    transactions,
    period,
    setPeriod,
    addTransaction,
    editTransaction,
    deleteTransaction,
    undoDelete,
    importTransactions,
    resetToDemo,
    filteredTransactions,
    metrics,
    categoryBreakdown,
    trendData,
    recurringSummary,
    recurringAnalysis,
    confirmRecurringCandidate,
    dismissRecurringCandidate,
    reinstateRecurringCandidate,
    resetRecurringReviews,
    anomalySummary,
    anomalyAnalysis,
    reviewAnomalyFinding,
    dismissAnomalyFinding,
    reinstateAnomalyFinding,
    resetAnomalyReviews,
    savingsSummary,
    isAddTxModalOpen,
    editingTransaction,
    openAddTxModal,
    openEditTxModal,
    closeAddTxModal,
    isImportModalOpen,
    openImportModal: () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
    isUsingFallback: initialStorageState.isUsingFallback,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
