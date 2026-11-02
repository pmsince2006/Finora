import { describe, it, expect } from 'vitest'
import {
  getReferenceDate,
  filterTransactionsByPeriod,
  calculateSummaryMetrics,
  calculateCategoryBreakdown,
  calculateSpendingTrend,
  calculateRecurringSummary,
  calculateAnomalySummary,
} from '../financeCalculations'
import type { Transaction } from '../../types/finance'

describe('financeCalculations', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-1',
      date: '2026-04-10',
      description: 'Acme Stipend',
      amount: 45000,
      category: 'Income',
      type: 'income',
      account: 'Bank Account',
    },
    {
      id: 'tx-2',
      date: '2026-04-15',
      description: 'Hostel Rent',
      amount: 12000,
      category: 'Housing',
      type: 'expense',
      account: 'UPI',
    },
    {
      id: 'tx-3',
      date: '2026-04-20',
      description: 'Supermarket Groceries',
      amount: 3500,
      category: 'Food & Dining',
      type: 'expense',
      account: 'Credit Card',
    },
    {
      id: 'tx-4',
      date: '2026-03-15',
      description: 'Previous Month Rent',
      amount: 12000,
      category: 'Housing',
      type: 'expense',
      account: 'UPI',
    },
    {
      id: 'tx-5',
      date: '2026-02-10',
      description: 'Winter Jacket',
      amount: 4000,
      category: 'Shopping',
      type: 'expense',
      account: 'Debit Card',
    },
  ]

  describe('getReferenceDate', () => {
    it('returns default anchor date 2026-04-30 for empty array', () => {
      const ref = getReferenceDate([])
      expect(ref.toISOString().slice(0, 10)).toBe('2026-04-30')
    })

    it('returns default anchor date when all transaction dates are invalid', () => {
      const invalidTxs: Transaction[] = [
        {
          id: 'bad-1',
          date: 'not-a-date',
          description: 'Broken',
          amount: 100,
          category: 'Misc',
          type: 'expense',
        },
      ]
      const ref = getReferenceDate(invalidTxs)
      expect(ref.toISOString().slice(0, 10)).toBe('2026-04-30')
    })

    it('returns the latest valid transaction date from the list', () => {
      const ref = getReferenceDate(sampleTransactions)
      expect(ref.toISOString().slice(0, 10)).toBe('2026-04-20')
    })
  })

  describe('filterTransactionsByPeriod', () => {
    it('returns all transactions when period is ALL', () => {
      const filtered = filterTransactionsByPeriod(sampleTransactions, 'ALL')
      expect(filtered.length).toBe(sampleTransactions.length)
    })

    it('filters for THIS_MONTH matching reference month (April 2026)', () => {
      const filtered = filterTransactionsByPeriod(sampleTransactions, 'THIS_MONTH')
      expect(filtered.map((t) => t.id)).toEqual(['tx-1', 'tx-2', 'tx-3'])
    })

    it('filters for 30D relative to the reference date (2026-04-20)', () => {
      const filtered = filterTransactionsByPeriod(sampleTransactions, '30D')
      expect(filtered.map((t) => t.id)).toEqual(['tx-1', 'tx-2', 'tx-3'])
    })

    it('filters for 60D and includes March transactions', () => {
      const filtered = filterTransactionsByPeriod(sampleTransactions, '60D')
      expect(filtered.map((t) => t.id)).toContain('tx-4')
      expect(filtered.map((t) => t.id)).not.toContain('tx-5')
    })

    it('safely drops transactions with corrupted date formats', () => {
      const corrupted: Transaction[] = [
        ...sampleTransactions,
        {
          id: 'bad-2',
          date: 'invalid',
          description: 'Corrupt',
          amount: 50,
          category: 'Misc',
          type: 'expense',
        },
      ]
      const filtered = filterTransactionsByPeriod(corrupted, 'THIS_MONTH')
      expect(filtered.find((t) => t.id === 'bad-2')).toBeUndefined()
    })
  })

  describe('calculateSummaryMetrics', () => {
    it('handles empty transaction dataset with zero values', () => {
      const metrics = calculateSummaryMetrics([])
      expect(metrics.totalIncome).toBe(0)
      expect(metrics.totalExpenses).toBe(0)
      expect(metrics.netCashflow).toBe(0)
      expect(metrics.incomeCount).toBe(0)
      expect(metrics.expenseCount).toBe(0)
      expect(metrics.potentialMonthlySavings).toBeGreaterThan(0)
    })

    it('computes exact sums for mixed income and expense sets', () => {
      const metrics = calculateSummaryMetrics(sampleTransactions)
      expect(metrics.totalIncome).toBe(45000)
      expect(metrics.totalExpenses).toBe(12000 + 3500 + 12000 + 4000)
      expect(metrics.netCashflow).toBe(45000 - 31500)
      expect(metrics.incomeCount).toBe(1)
      expect(metrics.expenseCount).toBe(4)
    })
  })

  describe('calculateCategoryBreakdown', () => {
    it('returns empty array when there are no expense transactions', () => {
      const incomeOnly: Transaction[] = [
        {
          id: 'inc-1',
          date: '2026-04-01',
          description: 'Salary',
          amount: 50000,
          category: 'Income',
          type: 'income',
        },
      ]
      expect(calculateCategoryBreakdown(incomeOnly)).toEqual([])
      expect(calculateCategoryBreakdown([])).toEqual([])
    })

    it('aggregates category amounts, counts, percentages, and sorts descending', () => {
      const breakdown = calculateCategoryBreakdown(sampleTransactions)
      expect(breakdown.length).toBe(3)

      const housing = breakdown[0]
      expect(housing.category).toBe('Housing')
      expect(housing.amount).toBe(24000)
      expect(housing.count).toBe(2)

      const totalExpense = 31500
      const expectedHousingPct = Number(((24000 / totalExpense) * 100).toFixed(1))
      expect(housing.percentage).toBe(expectedHousingPct)

      expect(breakdown[0].amount).toBeGreaterThanOrEqual(breakdown[1].amount)
      expect(breakdown[1].amount).toBeGreaterThanOrEqual(breakdown[2].amount)
    })
  })

  describe('calculateSpendingTrend', () => {
    it('returns empty array for empty transactions', () => {
      expect(calculateSpendingTrend([], '30D')).toEqual([])
      expect(calculateSpendingTrend([], 'ALL')).toEqual([])
    })

    it('produces 4 weekly buckets for 30D / THIS_MONTH periods', () => {
      const trend = calculateSpendingTrend(sampleTransactions, '30D')
      expect(trend.length).toBe(4)
      expect(trend[0].label).toBe('Apr 01 - 07')
      expect(trend[1].label).toBe('Apr 08 - 14')
      expect(trend[2].label).toBe('Apr 15 - 21')
      expect(trend[3].label).toBe('Apr 22 - 30')

      expect(trend[1].income).toBe(45000)
      expect(trend[1].expenses).toBe(0)

      expect(trend[2].income).toBe(0)
      expect(trend[2].expenses).toBe(15500)
    })

    it('produces 3 monthly buckets for 60D / 90D / ALL periods', () => {
      const trend = calculateSpendingTrend(sampleTransactions, 'ALL')
      expect(trend.length).toBe(3)
      expect(trend[0].label).toBe('February 2026')
      expect(trend[1].label).toBe('March 2026')
      expect(trend[2].label).toBe('April 2026')

      expect(trend[0].expenses).toBe(4000)
      expect(trend[1].expenses).toBe(12000)
      expect(trend[2].expenses).toBe(15500)
      expect(trend[2].income).toBe(45000)
    })
  })

  describe('summary wrappers', () => {
    it('returns valid recurring summary object', () => {
      const summary = calculateRecurringSummary(sampleTransactions)
      expect(summary).toHaveProperty('candidateCount')
      expect(summary).toHaveProperty('monthlyCommitment')
      expect(summary).toHaveProperty('candidates')
      expect(summary).toHaveProperty('upcomingCharges30Days')
    })

    it('returns valid anomaly summary object', () => {
      const summary = calculateAnomalySummary(sampleTransactions)
      expect(summary).toHaveProperty('reviewableCount')
      expect(summary).toHaveProperty('spikesTotal')
      expect(summary).toHaveProperty('findings')
      expect(summary).toHaveProperty('highSeverityCount')
    })
  })
})
