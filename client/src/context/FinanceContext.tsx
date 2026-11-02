import React, { useState, useMemo, useCallback } from 'react'
import type { Transaction, PeriodFilter } from '../types/finance'
import {
  filterTransactionsByPeriod,
  calculateSummaryMetrics,
  calculateCategoryBreakdown,
  calculateSpendingTrend,
  calculateRecurringSummary,
  calculateAnomalySummary,
  calculateSavingsSummary,
} from '../lib/financeCalculations'
import {
  loadTransactionsFromStorage,
  saveTransactionsToStorage,
  getFreshDemoTransactions,
} from '../lib/transactionStorage'
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

  // 6. RESET to Demo Dataset
  const resetToDemo = useCallback(() => {
    const fresh = getFreshDemoTransactions()
    setTransactions(fresh)
    saveTransactionsToStorage(fresh)
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

  const recurringSummary = useMemo(() => {
    return calculateRecurringSummary(transactions)
  }, [transactions])

  const anomalySummary = useMemo(() => {
    return calculateAnomalySummary(transactions)
  }, [transactions])

  // Synchronized savings summary (no empty dependency array bug)
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
    anomalySummary,
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
