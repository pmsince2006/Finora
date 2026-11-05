import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { Transaction, PeriodFilter } from '../types/finance'
import {
  filterTransactionsByPeriod,
  calculateSummaryMetrics,
  calculateCategoryBreakdown,
  calculateSpendingTrend,
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
import {
  detectSavingsOpportunities,
  type SavingsAnalysisResult,
} from '../lib/savingsDetection'
import {
  loadSavingsReviews,
  saveSavingsReview,
  removeSavingsReview,
  clearSavingsReviews,
  type SavingsReviewRecord,
} from '../lib/savingsStorage'
import { FinanceContext } from './financeContextDef'
import type { FinanceContextType } from './financeContextDef'
import { useAuth } from './useAuth'
import { api } from '../lib/api'

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [isLoadingCloudData, setIsLoadingCloudData] = useState(false)
  const [isCloudSynced, setIsCloudSynced] = useState(false)

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

  // Savings Reviews state initialized from localStorage
  const [savingsReviews, setSavingsReviews] = useState<Record<string, SavingsReviewRecord>>(() =>
    loadSavingsReviews()
  )

  const wasAuthenticatedRef = useRef(false)

  // Synchronize with backend when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (wasAuthenticatedRef.current) {
        // Revert to local storage state only when logging out from authenticated state
        const local = loadTransactionsFromStorage()
        setTransactions(local.transactions)
        setRecurringReviews(loadRecurringReviews())
        setAnomalyReviews(loadAnomalyReviews())
        setSavingsReviews(loadSavingsReviews())
        setIsCloudSynced(false)
        wasAuthenticatedRef.current = false
      }
      return
    }

    wasAuthenticatedRef.current = true
    let isMounted = true
    queueMicrotask(() => {
      if (isMounted) {
        setIsLoadingCloudData(true)
        setIsCloudSynced(false)
      }
    })

    let fetchFailed = false
    Promise.all([
      api.transactions.list().catch((err) => {
        fetchFailed = true
        console.error('[Finora API] Failed to fetch user transactions:', err)
        return { transactions: [] }
      }),
      api.reviews.getReviews().catch((err) => {
        fetchFailed = true
        console.error('[Finora API] Failed to fetch user reviews:', err)
        return { recurringReviews: {}, anomalyReviews: {}, savingsReviews: {} }
      }),
    ])
      .then(([txData, reviewData]) => {
        if (!isMounted) return
        if (!fetchFailed) {
          setTransactions(txData.transactions || [])
          setRecurringReviews(reviewData.recurringReviews || {})
          setAnomalyReviews(reviewData.anomalyReviews || {})
          setSavingsReviews(reviewData.savingsReviews || {})
          setIsCloudSynced(true)
        } else {
          setIsCloudSynced(false)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCloudData(false)
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user])

  // 1. CREATE Transaction
  const addTransaction = useCallback((newTx: Omit<Transaction, 'id'>): Transaction => {
    const created: Transaction = {
      ...newTx,
      id: `tx-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }
    setTransactions((prev) => {
      const next = [created, ...prev]
      if (!isAuthenticated) {
        saveTransactionsToStorage(next)
      }
      return next
    })

    if (isAuthenticated) {
      api.transactions.create(created).catch((err) => {
        console.error('[Finora API] Failed to create transaction on server:', err)
      })
    }

    return created
  }, [isAuthenticated])

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
      if (!isAuthenticated) {
        saveTransactionsToStorage(next)
      }
      success = true
      return next
    })

    if (isAuthenticated) {
      api.transactions.update(id, updated).catch((err) => {
        console.error('[Finora API] Failed to update transaction on server:', err)
      })
    }

    return success
  }, [isAuthenticated])

  // 3. DELETE Transaction
  const deleteTransaction = useCallback((id: string): Transaction | null => {
    let deleted: Transaction | null = null
    setTransactions((prev) => {
      const item = prev.find((t) => t.id === id)
      if (!item) return prev
      deleted = item

      const next = prev.filter((t) => t.id !== id)
      if (!isAuthenticated) {
        saveTransactionsToStorage(next)
      }
      return next
    })

    if (isAuthenticated) {
      api.transactions.delete(id).catch((err) => {
        console.error('[Finora API] Failed to delete transaction on server:', err)
      })
    }

    return deleted
  }, [isAuthenticated])

  // 4. UNDO DELETE
  const undoDelete = useCallback((restoredTx: Transaction) => {
    setTransactions((prev) => {
      // Avoid inserting duplicate if already present
      if (prev.some((t) => t.id === restoredTx.id)) return prev
      const next = [restoredTx, ...prev]
      if (!isAuthenticated) {
        saveTransactionsToStorage(next)
      }
      return next
    })

    if (isAuthenticated) {
      api.transactions.create(restoredTx).catch((err) => {
        console.error('[Finora API] Failed to restore transaction on server:', err)
      })
    }
  }, [isAuthenticated])

  // 5. BATCH IMPORT Transactions
  const importTransactions = useCallback((newTxs: Omit<Transaction, 'id'>[]): { importedCount: number } => {
    if (newTxs.length === 0) return { importedCount: 0 }

    const createdList: Transaction[] = newTxs.map((tx, idx) => ({
      ...tx,
      id: `tx-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    }))

    setTransactions((prev) => {
      const next = [...createdList, ...prev]
      if (!isAuthenticated) {
        saveTransactionsToStorage(next)
      }
      return next
    })

    if (isAuthenticated) {
      api.transactions.batchCreate(createdList).catch((err) => {
        console.error('[Finora API] Failed to batch create transactions on server:', err)
      })
    }

    return { importedCount: createdList.length }
  }, [isAuthenticated])

  // 6. RECURRING CANDIDATE REVIEWS
  const confirmRecurringCandidate = useCallback((candidateKey: string) => {
    const record: RecurringReviewRecord = {
      candidateKey,
      status: 'confirmed',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveRecurringReview(record)
    } else {
      api.reviews.saveRecurring(record).catch(console.error)
    }
    setRecurringReviews((prev) => ({ ...prev, [candidateKey]: record }))
  }, [isAuthenticated])

  const dismissRecurringCandidate = useCallback((candidateKey: string) => {
    const record: RecurringReviewRecord = {
      candidateKey,
      status: 'dismissed',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveRecurringReview(record)
    } else {
      api.reviews.saveRecurring(record).catch(console.error)
    }
    setRecurringReviews((prev) => ({ ...prev, [candidateKey]: record }))
  }, [isAuthenticated])

  const reinstateRecurringCandidate = useCallback((candidateKey: string) => {
    if (!isAuthenticated) {
      removeRecurringReview(candidateKey)
    } else {
      api.reviews.removeRecurring(candidateKey).catch(console.error)
    }
    setRecurringReviews((prev) => {
      const next = { ...prev }
      delete next[candidateKey]
      return next
    })
  }, [isAuthenticated])

  const resetRecurringReviews = useCallback(() => {
    if (!isAuthenticated) {
      clearRecurringReviews()
    } else {
      api.reviews.resetRecurring().catch(console.error)
    }
    setRecurringReviews({})
  }, [isAuthenticated])

  // 7. SPENDING ANOMALY REVIEWS
  const reviewAnomalyFinding = useCallback((findingKey: string) => {
    const record: AnomalyReviewRecord = {
      findingKey,
      transactionId: findingKey.replace(/^anom-/, '').replace(/-[^-]+$/, ''),
      status: 'reviewed',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveAnomalyReview(record)
    } else {
      api.reviews.saveAnomaly(record).catch(console.error)
    }
    setAnomalyReviews((prev) => ({ ...prev, [findingKey]: record }))
  }, [isAuthenticated])

  const dismissAnomalyFinding = useCallback((findingKey: string) => {
    const record: AnomalyReviewRecord = {
      findingKey,
      transactionId: findingKey.replace(/^anom-/, '').replace(/-[^-]+$/, ''),
      status: 'dismissed',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveAnomalyReview(record)
    } else {
      api.reviews.saveAnomaly(record).catch(console.error)
    }
    setAnomalyReviews((prev) => ({ ...prev, [findingKey]: record }))
  }, [isAuthenticated])

  const reinstateAnomalyFinding = useCallback((findingKey: string) => {
    if (!isAuthenticated) {
      removeAnomalyReview(findingKey)
    } else {
      api.reviews.removeAnomaly(findingKey).catch(console.error)
    }
    setAnomalyReviews((prev) => {
      const next = { ...prev }
      delete next[findingKey]
      return next
    })
  }, [isAuthenticated])

  const resetAnomalyReviews = useCallback(() => {
    if (!isAuthenticated) {
      clearAnomalyReviews()
    } else {
      api.reviews.resetAnomaly().catch(console.error)
    }
    setAnomalyReviews({})
  }, [isAuthenticated])

  // 8. SAVINGS OPPORTUNITY REVIEWS
  const saveSavingsOpportunity = useCallback((opportunityKey: string) => {
    const record: SavingsReviewRecord = {
      opportunityKey,
      status: 'saved',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveSavingsReview(record)
    } else {
      api.reviews.saveSavings(record).catch(console.error)
    }
    setSavingsReviews((prev) => ({ ...prev, [opportunityKey]: record }))
  }, [isAuthenticated])

  const planSavingsOpportunity = useCallback(
    (opportunityKey: string, customTarget?: number) => {
      const record: SavingsReviewRecord = {
        opportunityKey,
        status: 'planned',
        reviewedAt: new Date().toISOString(),
        customTargetPercent: customTarget,
      }
      if (!isAuthenticated) {
        saveSavingsReview(record)
      } else {
        api.reviews.saveSavings(record).catch(console.error)
      }
      setSavingsReviews((prev) => ({ ...prev, [opportunityKey]: record }))
    },
    [isAuthenticated]
  )

  const completeSavingsOpportunity = useCallback((opportunityKey: string) => {
    const record: SavingsReviewRecord = {
      opportunityKey,
      status: 'completed',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveSavingsReview(record)
    } else {
      api.reviews.saveSavings(record).catch(console.error)
    }
    setSavingsReviews((prev) => ({ ...prev, [opportunityKey]: record }))
  }, [isAuthenticated])

  const dismissSavingsOpportunity = useCallback((opportunityKey: string) => {
    const record: SavingsReviewRecord = {
      opportunityKey,
      status: 'dismissed',
      reviewedAt: new Date().toISOString(),
    }
    if (!isAuthenticated) {
      saveSavingsReview(record)
    } else {
      api.reviews.saveSavings(record).catch(console.error)
    }
    setSavingsReviews((prev) => ({ ...prev, [opportunityKey]: record }))
  }, [isAuthenticated])

  const reinstateSavingsOpportunity = useCallback((opportunityKey: string) => {
    if (!isAuthenticated) {
      removeSavingsReview(opportunityKey)
    } else {
      api.reviews.removeSavings(opportunityKey).catch(console.error)
    }
    setSavingsReviews((prev) => {
      const next = { ...prev }
      delete next[opportunityKey]
      return next
    })
  }, [isAuthenticated])

  const resetSavingsReviews = useCallback(() => {
    if (!isAuthenticated) {
      clearSavingsReviews()
    } else {
      api.reviews.resetSavings().catch(console.error)
    }
    setSavingsReviews({})
  }, [isAuthenticated])

  // Explicit user action to copy sample demo transactions into personal account
  const seedDemoDataToAccount = useCallback(async () => {
    const fresh = getFreshDemoTransactions()
    if (isAuthenticated) {
      try {
        await api.transactions.batchCreate(fresh)
      } catch (err) {
        console.error('[Finora API] Failed to seed demo records:', err)
      }
    }
    setTransactions(fresh)
  }, [isAuthenticated])

  // 9. RESET to Demo Dataset
  const resetToDemo = useCallback(() => {
    const fresh = getFreshDemoTransactions()
    setTransactions(fresh)
    if (!isAuthenticated) {
      saveTransactionsToStorage(fresh)
      clearRecurringReviews()
      clearAnomalyReviews()
      clearSavingsReviews()
    } else {
      api.transactions.clearAll().then(() => api.transactions.batchCreate(fresh)).catch(console.error)
      api.reviews.resetRecurring().catch(console.error)
      api.reviews.resetAnomaly().catch(console.error)
      api.reviews.resetSavings().catch(console.error)
    }
    setRecurringReviews({})
    setAnomalyReviews({})
    setSavingsReviews({})
  }, [isAuthenticated])

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

  // Pure deterministic Savings Opportunity Lab engine
  const savingsAnalysis: SavingsAnalysisResult = useMemo(() => {
    return detectSavingsOpportunities(transactions, savingsReviews, {
      recurringCandidates: recurringAnalysis.activeCandidates,
      anomalyFindings: anomalyAnalysis.activeFindings,
    })
  }, [
    transactions,
    savingsReviews,
    recurringAnalysis.activeCandidates,
    anomalyAnalysis.activeFindings,
  ])

  const savingsSummary = savingsAnalysis.summary
  const savingsOpportunities = savingsAnalysis.allOpportunities

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
    savingsAnalysis,
    savingsOpportunities,
    saveSavingsOpportunity,
    planSavingsOpportunity,
    completeSavingsOpportunity,
    dismissSavingsOpportunity,
    reinstateSavingsOpportunity,
    resetSavingsReviews,
    isAddTxModalOpen,
    editingTransaction,
    openAddTxModal,
    openEditTxModal,
    closeAddTxModal,
    isImportModalOpen,
    openImportModal: () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
    isUsingFallback: initialStorageState.isUsingFallback,
    isCloudSynced,
    isLoadingCloudData,
    seedDemoDataToAccount,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
