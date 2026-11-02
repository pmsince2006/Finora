import React, { useState, useMemo } from 'react'
import type {
  Transaction,
  PeriodFilter,
} from '../types/finance'
import { DEMO_TRANSACTIONS } from '../data/demoTransactions'
import {
  filterTransactionsByPeriod,
  calculateSummaryMetrics,
  calculateCategoryBreakdown,
  calculateSpendingTrend,
  calculateRecurringSummary,
  calculateAnomalySummary,
  calculateSavingsSummary,
} from '../lib/financeCalculations'
import { FinanceContext } from './financeContextDef'
import type { FinanceContextType } from './financeContextDef'

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS)
  const [period, setPeriod] = useState<PeriodFilter>('30D')
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const created: Transaction = {
      ...newTx,
      id: `tx-user-${Date.now()}`,
    }
    setTransactions((prev) => [created, ...prev])
  }

  const resetToDemo = () => {
    setTransactions(DEMO_TRANSACTIONS)
  }

  // Derive filtered transactions and analytics deterministically
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

  const savingsSummary = useMemo(() => {
    return calculateSavingsSummary()
  }, [])

  const value: FinanceContextType = {
    transactions,
    period,
    setPeriod,
    addTransaction,
    resetToDemo,
    filteredTransactions,
    metrics,
    categoryBreakdown,
    trendData,
    recurringSummary,
    anomalySummary,
    savingsSummary,
    isAddTxModalOpen,
    openAddTxModal: () => setIsAddTxModalOpen(true),
    closeAddTxModal: () => setIsAddTxModalOpen(false),
    isImportModalOpen,
    openImportModal: () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}


