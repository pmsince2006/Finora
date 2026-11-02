import type {
  Transaction,
  PeriodFilter,
  SummaryMetrics,
  CategoryBreakdown,
  SpendingTrendPoint,
  RecurringSummary,
  AnomalySummary,
  SavingsSummary,
  AnomalyFinding,
} from '../types/finance'
import { DEMO_RECURRING_CANDIDATES, DEMO_SAVINGS_SCENARIOS } from '../data/demoTransactions'

/**
 * SpendSleuth Core Financial Calculation Engine
 * 
 * Rules & Accounting Assumptions:
 * 1. Sign Convention: Amounts are positive floats/integers.
 * 2. Inflow / Outflow: Transactions with `type === 'income'` are summed into Total Income.
 *    Transactions with `type === 'expense'` are summed into Total Expenses.
 * 3. Net Cashflow = Total Income - Total Expenses.
 * 4. Category Reconciliations: Category breakdown sums 100% to Total Expenses for eligible periods.
 * 5. Savings Scenarios: Potential monthly savings is derived strictly from verified candidate optimization
 *    scenarios (dining moderation, cloud tier rightsizing, meal prep), not from speculative or arbitrary assumptions.
 * 6. Reference Date: 2026-04-30 (or the latest transaction date in dataset) anchors the period filters.
 */

export function getReferenceDate(transactions: Transaction[]): Date {
  if (transactions.length === 0) return new Date('2026-04-30')
  const dates = transactions
    .map((t) => new Date(t.date).getTime())
    .filter((time) => !isNaN(time))
  if (dates.length === 0) return new Date('2026-04-30')
  return new Date(Math.max(...dates))
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: PeriodFilter
): Transaction[] {
  if (period === 'ALL') return transactions

  const refDate = getReferenceDate(transactions)
  const refTime = refDate.getTime()

  return transactions.filter((t) => {
    const txTime = new Date(t.date).getTime()
    if (isNaN(txTime)) return false

    if (period === 'THIS_MONTH') {
      const txDate = new Date(t.date)
      return (
        txDate.getFullYear() === refDate.getFullYear() &&
        txDate.getMonth() === refDate.getMonth()
      )
    }

    const daysDiff = (refTime - txTime) / (1000 * 60 * 60 * 24)

    if (period === '30D') return daysDiff >= 0 && daysDiff <= 30
    if (period === '60D') return daysDiff >= 0 && daysDiff <= 60
    if (period === '90D') return daysDiff >= 0 && daysDiff <= 90

    return true
  })
}

export function calculateSummaryMetrics(transactions: Transaction[]): SummaryMetrics {
  let totalIncome = 0
  let totalExpenses = 0
  let incomeCount = 0
  let expenseCount = 0

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount
      incomeCount++
    } else if (t.type === 'expense') {
      totalExpenses += t.amount
      expenseCount++
    }
  }

  const netCashflow = totalIncome - totalExpenses

  // Potential monthly savings calculated from eligible scenarios
  const potentialMonthlySavings = DEMO_SAVINGS_SCENARIOS.reduce(
    (sum, s) => sum + s.potentialMonthlySavings,
    0
  )

  return {
    totalIncome,
    totalExpenses,
    netCashflow,
    potentialMonthlySavings,
    incomeCount,
    expenseCount,
  }
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenseMap = new Map<string, { amount: number; count: number }>()
  let totalExpense = 0

  for (const t of transactions) {
    if (t.type === 'expense') {
      totalExpense += t.amount
      const current = expenseMap.get(t.category) || { amount: 0, count: 0 }
      expenseMap.set(t.category, {
        amount: current.amount + t.amount,
        count: current.count + 1,
      })
    }
  }

  if (totalExpense === 0) return []

  const breakdown: CategoryBreakdown[] = []
  for (const [category, data] of expenseMap.entries()) {
    breakdown.push({
      category,
      amount: data.amount,
      percentage: Number(((data.amount / totalExpense) * 100).toFixed(1)),
      count: data.count,
    })
  }

  // Sort descending by total amount
  return breakdown.sort((a, b) => b.amount - a.amount)
}

export function calculateSpendingTrend(
  transactions: Transaction[],
  period: PeriodFilter
): SpendingTrendPoint[] {
  if (transactions.length === 0) return []

  if (period === '30D' || period === 'THIS_MONTH') {
    // 4 Weekly intervals for the current month / 30 days
    const intervals = [
      { label: 'Apr 01 - 07', start: '2026-04-01', end: '2026-04-07' },
      { label: 'Apr 08 - 14', start: '2026-04-08', end: '2026-04-14' },
      { label: 'Apr 15 - 21', start: '2026-04-15', end: '2026-04-21' },
      { label: 'Apr 22 - 30', start: '2026-04-22', end: '2026-04-30' },
    ]

    return intervals.map((inv) => {
      let income = 0
      let expenses = 0

      for (const t of transactions) {
        if (t.date >= inv.start && t.date <= inv.end) {
          if (t.type === 'income') income += t.amount
          if (t.type === 'expense') expenses += t.amount
        }
      }

      return {
        date: inv.start,
        label: inv.label,
        income,
        expenses,
        baseline: 8500, // typical expected weekly baseline
        net: income - expenses,
      }
    })
  }

  // For 60D, 90D, or ALL: Group by calendar month
  const monthlyBuckets = [
    { label: 'February 2026', key: '2026-02', baseline: 32000 },
    { label: 'March 2026', key: '2026-03', baseline: 32000 },
    { label: 'April 2026', key: '2026-04', baseline: 32000 },
  ]

  return monthlyBuckets.map((bucket) => {
    let income = 0
    let expenses = 0

    for (const t of transactions) {
      if (t.date.startsWith(bucket.key)) {
        if (t.type === 'income') income += t.amount
        if (t.type === 'expense') expenses += t.amount
      }
    }

    return {
      date: `${bucket.key}-01`,
      label: bucket.label,
      income,
      expenses,
      baseline: bucket.baseline,
      net: income - expenses,
    }
  })
}

export function calculateRecurringSummary(transactions: Transaction[]): RecurringSummary {
  // Use candidates present in transactions or fallback to verified candidates
  const recurringTxs = transactions.filter((t) => t.isRecurringCandidate || t.status === 'recurring')
  
  // Reconcile with verified candidates list
  const candidates = DEMO_RECURRING_CANDIDATES
  const monthlyCommitment = candidates.reduce((sum, c) => {
    if (c.cadence === 'Monthly') return sum + c.amount
    if (c.cadence === 'Weekly') return sum + c.amount * 4.33
    if (c.cadence === 'Annual') return sum + c.amount / 12
    return sum + c.amount
  }, 0)

  return {
    candidateCount: Math.max(candidates.length, recurringTxs.length),
    monthlyCommitment: Math.round(monthlyCommitment),
    annualCommitment: Math.round(monthlyCommitment * 12),
    candidates,
  }
}

export function calculateAnomalySummary(transactions: Transaction[]): AnomalySummary {
  const findings: AnomalyFinding[] = []
  let spikesTotal = 0

  for (const t of transactions) {
    if (t.isAnomaly && t.type === 'expense') {
      spikesTotal += t.amount
      findings.push({
        id: t.id,
        merchant: t.description,
        category: t.category,
        amount: t.amount,
        baselineAmount: t.baselineAmount || Math.round(t.amount * 0.3),
        ratio: t.baselineAmount ? Number((t.amount / t.baselineAmount).toFixed(1)) : 3.5,
        severity: t.anomalySeverity || 'medium',
        reason: t.anomalyReason || 'Statistical outlier compared to running category average',
        date: t.date,
      })
    }
  }

  return {
    reviewableCount: findings.length,
    spikesTotal,
    findings,
  }
}

export function calculateSavingsSummary(): SavingsSummary {
  const scenarios = DEMO_SAVINGS_SCENARIOS
  const totalIdentifiedMonthly = scenarios.reduce((sum, s) => sum + s.potentialMonthlySavings, 0)

  return {
    topOpportunity: scenarios[0],
    totalIdentifiedMonthly,
    scenarios,
  }
}
