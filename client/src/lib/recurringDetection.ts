import type {
  Transaction,
  RecurringCadence,
  RecurringCandidate,
  RecurringSummary,
  ReviewStatus,
  AmountVariability,
  CadenceConsistency,
  UpcomingCharge,
} from '../types/finance'
import { normalizeMerchant } from './transactionFingerprint'
import {
  getDeterministicCandidateKey,
  type RecurringReviewRecord,
} from './recurringStorage'

export interface RecurringAnalysisResult {
  summary: RecurringSummary
  allCandidates: RecurringCandidate[]
  activeCandidates: RecurringCandidate[]
  confirmedCandidates: RecurringCandidate[]
  suggestedCandidates: RecurringCandidate[]
  dismissedCandidates: RecurringCandidate[]
}

/**
 * Returns number of days in a given month (1-12) for a given year.
 * Correctly accounts for leap years.
 */
export function getDaysInMonth(year: number, month1To12: number): number {
  return new Date(Date.UTC(year, month1To12, 0)).getUTCDate()
}

/**
 * Adds an integer number of days to an ISO date 'YYYY-MM-DD'.
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Adds an integer number of calendar months to an ISO date 'YYYY-MM-DD'.
 * Handles month-end clamping (e.g. Jan 31 + 1 month -> Feb 28/29) and leap years.
 */
export function addMonths(dateStr: string, monthsToAdd: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const totalMonths = (m - 1) + monthsToAdd
  const newYear = y + Math.floor(totalMonths / 12)
  const newMonth = ((totalMonths % 12) + 12) % 12 + 1
  const maxDays = getDaysInMonth(newYear, newMonth)
  const newDay = Math.min(d, maxDays)
  return `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`
}

/**
 * Calculates day difference between two dates (date2 - date1).
 */
export function getDayDifference(date1Str: string, date2Str: string): number {
  const [y1, m1, d1] = date1Str.split('-').map(Number)
  const [y2, m2, d2] = date2Str.split('-').map(Number)
  const t1 = Date.UTC(y1, m1 - 1, d1)
  const t2 = Date.UTC(y2, m2 - 1, d2)
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24))
}

/**
 * Calculates calendar month difference between two dates.
 */
export function getMonthDifference(date1Str: string, date2Str: string): number {
  const [y1, m1] = date1Str.split('-').map(Number)
  const [y2, m2] = date2Str.split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1)
}

/**
 * Generates an ordinal representation (e.g. 1st, 2nd, 3rd, 24th).
 */
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Analyzes intervals between consecutive charges to determine cadence.
 */
export function detectCadence(sortedDates: string[]): {
  cadence: RecurringCadence
  cadenceConsistency: CadenceConsistency
  avgIntervalDays: number
} {
  if (sortedDates.length < 2) {
    return {
      cadence: 'Irregular / Uncertain',
      cadenceConsistency: 'irregular',
      avgIntervalDays: 0,
    }
  }

  const intervals: number[] = []
  const monthDiffs: number[] = []
  const dayOfMonthDiffs: number[] = []

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const d1 = sortedDates[i]
    const d2 = sortedDates[i + 1]
    const days = getDayDifference(d1, d2)
    intervals.push(days)
    monthDiffs.push(getMonthDifference(d1, d2))
    const dom1 = parseInt(d1.split('-')[2], 10)
    const dom2 = parseInt(d2.split('-')[2], 10)
    dayOfMonthDiffs.push(Math.abs(dom2 - dom1))
  }

  const avgInterval = intervals.reduce((sum, v) => sum + v, 0) / intervals.length
  const maxDayDiff = Math.max(...dayOfMonthDiffs)

  // 1. Weekly: ~7 days (tolerance 5 to 9 days)
  const allWeekly = intervals.every((d) => d >= 5 && d <= 9)
  if (allWeekly || (avgInterval >= 5.5 && avgInterval <= 8.5 && intervals.every((d) => d >= 4 && d <= 10))) {
    const isStrict = intervals.every((d) => Math.abs(d - 7) <= 1)
    return {
      cadence: 'Weekly',
      cadenceConsistency: isStrict ? 'regular' : 'moderate',
      avgIntervalDays: Math.round(avgInterval * 10) / 10,
    }
  }

  // 2. Fortnightly: ~14 days (tolerance 11 to 17 days)
  const allFortnightly = intervals.every((d) => d >= 11 && d <= 17)
  if (allFortnightly || (avgInterval >= 12 && avgInterval <= 16 && intervals.every((d) => d >= 10 && d <= 18))) {
    return {
      cadence: 'Fortnightly',
      cadenceConsistency: 'regular',
      avgIntervalDays: Math.round(avgInterval * 10) / 10,
    }
  }

  // 3. Monthly: ~25 to 35 days OR consecutive calendar months with consistent day of month (<= 5 days)
  const allConsecutiveMonths = monthDiffs.every((m) => m === 1) && maxDayDiff <= 5
  const allMonthlyDays = intervals.every((d) => d >= 25 && d <= 35)
  if (allConsecutiveMonths || allMonthlyDays || (avgInterval >= 26 && avgInterval <= 34)) {
    const isStrict = maxDayDiff <= 1
    return {
      cadence: 'Monthly',
      cadenceConsistency: isStrict ? 'regular' : 'moderate',
      avgIntervalDays: Math.round(avgInterval * 10) / 10,
    }
  }

  // 4. Quarterly: ~80 to 102 days OR 3 calendar months apart
  const allQuarterlyMonths = monthDiffs.every((m) => m === 3) && maxDayDiff <= 8
  const allQuarterlyDays = intervals.every((d) => d >= 80 && d <= 102)
  if (allQuarterlyMonths || allQuarterlyDays || (avgInterval >= 82 && avgInterval <= 100)) {
    return {
      cadence: 'Quarterly',
      cadenceConsistency: maxDayDiff <= 2 ? 'regular' : 'moderate',
      avgIntervalDays: Math.round(avgInterval * 10) / 10,
    }
  }

  // 5. Annually: ~345 to 385 days OR 12 calendar months apart
  const allAnnualMonths = monthDiffs.every((m) => m === 12) && maxDayDiff <= 15
  const allAnnualDays = intervals.every((d) => d >= 345 && d <= 385)
  if (allAnnualMonths || allAnnualDays || (avgInterval >= 345 && avgInterval <= 385)) {
    return {
      cadence: 'Annually',
      cadenceConsistency: maxDayDiff <= 3 ? 'regular' : 'moderate',
      avgIntervalDays: Math.round(avgInterval * 10) / 10,
    }
  }

  return {
    cadence: 'Irregular / Uncertain',
    cadenceConsistency: 'irregular',
    avgIntervalDays: Math.round(avgInterval * 10) / 10,
  }
}

/**
 * Projects the next expected billing date based on cadence and latest charge date.
 * If referenceDate is passed and the base next date is in the past, advances forward
 * by cadence increments until reaching an upcoming date.
 */
export function projectNextDate(
  lastBilled: string,
  cadence: RecurringCadence,
  referenceDate?: string
): string | null {
  if (cadence === 'Irregular / Uncertain') return null

  let next = ''
  if (cadence === 'Weekly') next = addDays(lastBilled, 7)
  else if (cadence === 'Fortnightly') next = addDays(lastBilled, 14)
  else if (cadence === 'Monthly') next = addMonths(lastBilled, 1)
  else if (cadence === 'Quarterly') next = addMonths(lastBilled, 3)
  else if (cadence === 'Annually' || cadence === 'Annual') next = addMonths(lastBilled, 12)
  else return null

  // If reference date is given and next date is in the past, roll forward
  if (referenceDate && next < referenceDate) {
    let guard = 0
    while (next < referenceDate && guard < 24) {
      guard++
      if (cadence === 'Weekly') next = addDays(next, 7)
      else if (cadence === 'Fortnightly') next = addDays(next, 14)
      else if (cadence === 'Monthly') next = addMonths(next, 1)
      else if (cadence === 'Quarterly') next = addMonths(next, 3)
      else if (cadence === 'Annually' || cadence === 'Annual') next = addMonths(next, 12)
    }
  }

  return next
}

/**
 * Calculates monthly and annual cost equivalents based on detected cadence.
 */
export function calculateEquivalents(
  amount: number,
  cadence: RecurringCadence,
  avgIntervalDays?: number
): { monthlyEquivalent: number; annualEquivalent: number } {
  const roundedAmt = Math.round(amount * 100) / 100

  switch (cadence) {
    case 'Weekly':
      return {
        monthlyEquivalent: Math.round(roundedAmt * (52 / 12)),
        annualEquivalent: Math.round(roundedAmt * 52),
      }
    case 'Fortnightly':
      return {
        monthlyEquivalent: Math.round(roundedAmt * (26 / 12)),
        annualEquivalent: Math.round(roundedAmt * 26),
      }
    case 'Monthly':
      return {
        monthlyEquivalent: Math.round(roundedAmt),
        annualEquivalent: Math.round(roundedAmt * 12),
      }
    case 'Quarterly':
      return {
        monthlyEquivalent: Math.round(roundedAmt / 3),
        annualEquivalent: Math.round(roundedAmt * 4),
      }
    case 'Annually':
    case 'Annual':
      return {
        monthlyEquivalent: Math.round(roundedAmt / 12),
        annualEquivalent: Math.round(roundedAmt),
      }
    case 'Irregular / Uncertain':
    default: {
      if (avgIntervalDays && avgIntervalDays > 0) {
        const estMonthly = Math.round(roundedAmt * (30.4375 / avgIntervalDays))
        return {
          monthlyEquivalent: estMonthly,
          annualEquivalent: Math.round(estMonthly * 12),
        }
      }
      return {
        monthlyEquivalent: Math.round(roundedAmt),
        annualEquivalent: Math.round(roundedAmt * 12),
      }
    }
  }
}

/**
 * Crafts beginner-friendly, transparent explanations.
 */
function generateExplanation(params: {
  merchant: string
  occurrenceCount: number
  cadence: RecurringCadence
  amountVariability: AmountVariability
  cadenceConsistency: CadenceConsistency
  averageAmount: number
  reviewStatus: ReviewStatus
  latestDate: string
}): string {
  const { occurrenceCount, cadence, amountVariability, cadenceConsistency, averageAmount, reviewStatus, latestDate } = params

  if (reviewStatus === 'confirmed') {
    return 'Confirmed subscription active in your recurring budget.'
  }
  if (reviewStatus === 'dismissed') {
    return 'Dismissed from active subscriptions list.'
  }

  const formattedAmt = `₹${Math.round(averageAmount).toLocaleString('en-IN')}`
  const dom = parseInt(latestDate.split('-')[2], 10)
  const dayStr = getOrdinal(dom)

  if (occurrenceCount === 2) {
    if (cadence === 'Monthly') {
      return `Found 2 payments ~1 month apart (${formattedAmt}). This is a tentative pattern that needs another billing cycle to confirm.`
    }
    if (cadence === 'Weekly') {
      return `Found 2 payments ~1 week apart (${formattedAmt}). This is a tentative pattern that needs another billing cycle to confirm.`
    }
    return `Found 2 similar payments. This is a tentative pattern that needs another billing cycle to confirm.`
  }

  if (cadence === 'Monthly') {
    if (amountVariability === 'exact') {
      return `Found ${occurrenceCount} identical monthly payments (${formattedAmt}) billed around the ${dayStr}.`
    }
    return `Found ${occurrenceCount} monthly payments averaging ${formattedAmt} with usage-based variance.`
  }

  if (cadence === 'Weekly') {
    return `Found ${occurrenceCount} weekly payments billed ~7 days apart (${formattedAmt} each).`
  }

  if (cadence === 'Fortnightly') {
    return `Found ${occurrenceCount} bi-weekly payments billed ~14 days apart (${formattedAmt} each).`
  }

  if (cadence === 'Annually' || cadence === 'Annual') {
    return `Found ${occurrenceCount} annual renewal charges (${formattedAmt}).`
  }

  if (cadence === 'Quarterly') {
    return `Found ${occurrenceCount} quarterly charges billed every ~3 months.`
  }

  if (occurrenceCount === 2) {
    return `Found 2 similar payments. This is a tentative pattern that needs another billing cycle to confirm.`
  }

  if (cadenceConsistency === 'irregular') {
    return `Detected ${occurrenceCount} repeat charges, but intervals vary significantly.`
  }

  return `Detected ${occurrenceCount} repeated payments with average cost ${formattedAmt}.`
}

/**
 * Pure, deterministic detection engine analyzing canonical transactions.
 * Returns candidate list, review status mappings, aggregates, and next 30 days schedule.
 */
export function detectRecurringPayments(
  transactions: Transaction[],
  reviews: Record<string, RecurringReviewRecord> = {},
  referenceDateStr?: string
): RecurringAnalysisResult {
  // 1. Transaction Eligibility Filter
  // Only valid expense transactions with positive amounts and valid dates
  const eligible = transactions.filter((t) => {
    if (t.type !== 'expense') return false
    if (typeof t.amount !== 'number' || t.amount <= 0 || !isFinite(t.amount)) return false
    if (!t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return false
    if (!t.description || !t.description.trim()) return false
    return true
  })

  // 2. Group by Normalized Merchant
  const groups = new Map<string, Transaction[]>()
  for (const tx of eligible) {
    const norm = normalizeMerchant(tx.description)
    if (!norm) continue
    const list = groups.get(norm) || []
    list.push(tx)
    groups.set(norm, list)
  }

  // Determine global reference date (defaults to latest transaction date or today)
  let referenceDate = referenceDateStr
  if (!referenceDate) {
    const allDates = eligible.map((t) => t.date).sort()
    referenceDate = allDates.length > 0 ? allDates[allDates.length - 1] : new Date().toISOString().slice(0, 10)
  }

  const allCandidates: RecurringCandidate[] = []

  // 3. Cadence and Confidence Analysis per Group
  for (const [normMerchant, txGroup] of groups.entries()) {
    // Need at least 2 occurrences to establish any recurring pattern
    if (txGroup.length < 2) continue

    // Sort chronologically ascending (oldest to newest)
    const sorted = [...txGroup].sort((a, b) => a.date.localeCompare(b.date))
    const sortedDates = sorted.map((t) => t.date)
    const amounts = sorted.map((t) => t.amount)

    const occurrenceCount = sorted.length
    const latestTx = sorted[sorted.length - 1]
    const lastBilled = latestTx.date
    const displayName = latestTx.description
    const category = latestTx.category || 'Digital Services'
    const matchingTransactionIds = sorted.map((t) => t.id)

    // Analyze Cadence
    const { cadence, cadenceConsistency, avgIntervalDays } = detectCadence(sortedDates)

    // Analyze Amount Variability
    const minAmount = Math.min(...amounts)
    const maxAmount = Math.max(...amounts)
    const totalAmount = amounts.reduce((sum, a) => sum + a, 0)
    const averageAmount = Math.round((totalAmount / amounts.length) * 100) / 100
    const relDiff = averageAmount > 0 ? (maxAmount - minAmount) / averageAmount : 0

    let amountVariability: AmountVariability = 'exact'
    if (relDiff === 0) amountVariability = 'exact'
    else if (relDiff <= 0.10) amountVariability = 'low'
    else if (relDiff <= 0.30) amountVariability = 'moderate'
    else amountVariability = 'high'

    // Compute Confidence Score
    let baseConfidence = 0.50
    if (cadence === 'Annually' || cadence === 'Annual' || cadence === 'Quarterly') {
      baseConfidence = occurrenceCount >= 2 ? 0.75 : 0.50
    } else if (occurrenceCount === 2) {
      baseConfidence = 0.52
    } else if (occurrenceCount === 3) {
      baseConfidence = 0.85
    } else if (occurrenceCount === 4) {
      baseConfidence = 0.92
    } else {
      baseConfidence = 0.96
    }

    // Consistency modifiers
    let confidenceMod = 0
    if (cadenceConsistency === 'regular') confidenceMod += 0.04
    else if (cadenceConsistency === 'irregular') confidenceMod -= 0.20

    if (amountVariability === 'exact') confidenceMod += 0.04
    else if (amountVariability === 'low') confidenceMod += 0.01
    else if (amountVariability === 'moderate') confidenceMod -= 0.04
    else if (amountVariability === 'high') confidenceMod -= 0.12

    let confidence = Math.max(0.20, Math.min(0.99, Math.round((baseConfidence + confidenceMod) * 100) / 100))

    // Candidate key and review state reconciliation
    const candidateKey = getDeterministicCandidateKey(normMerchant)
    const review = reviews[candidateKey]

    let reviewStatus: ReviewStatus = 'suggested'
    let statusLabel: 'Candidate' | 'Confirmed' | 'Dismissed' = 'Candidate'

    if (review?.status === 'confirmed') {
      reviewStatus = 'confirmed'
      statusLabel = 'Confirmed'
      confidence = 1.0
    } else if (review?.status === 'dismissed') {
      reviewStatus = 'dismissed'
      statusLabel = 'Dismissed'
    }

    // Next expected charge date
    const nextExpected = projectNextDate(lastBilled, cadence, referenceDate)

    // Equivalents
    const { monthlyEquivalent, annualEquivalent } = calculateEquivalents(averageAmount, cadence, avgIntervalDays)

    // Explanation
    const explanation = generateExplanation({
      merchant: displayName,
      occurrenceCount,
      cadence,
      amountVariability,
      cadenceConsistency,
      averageAmount,
      reviewStatus,
      latestDate: lastBilled,
    })

    allCandidates.push({
      id: `rec-cand-${normMerchant.replace(/\s+/g, '-')}`,
      candidateKey,
      merchant: displayName,
      category,
      amount: averageAmount,
      cadence,
      confidence,
      lastBilled,
      nextExpected,
      status: statusLabel,
      occurrenceCount,
      matchingTransactionIds,
      averageAmount,
      monthlyEquivalent,
      annualEquivalent,
      amountVariability,
      cadenceConsistency,
      explanation,
      reviewStatus,
      reviewedAt: review?.reviewedAt,
    })
  }

  // Sort candidates by monthly equivalent descending by default
  allCandidates.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent)

  const activeCandidates = allCandidates.filter((c) => c.reviewStatus !== 'dismissed')
  const confirmedCandidates = allCandidates.filter((c) => c.reviewStatus === 'confirmed')
  const suggestedCandidates = allCandidates.filter((c) => c.reviewStatus === 'suggested')
  const dismissedCandidates = allCandidates.filter((c) => c.reviewStatus === 'dismissed')

  // Aggregate monthly and annual commitments without double-counting
  const monthlyCommitment = activeCandidates.reduce((sum, c) => sum + c.monthlyEquivalent, 0)
  const annualCommitment = activeCandidates.reduce((sum, c) => sum + c.annualEquivalent, 0)

  // Identify upcoming charges within next 30 days from reference date
  const upcomingCharges30Days: UpcomingCharge[] = []
  for (const c of activeCandidates) {
    if (c.nextExpected) {
      const daysUntil = getDayDifference(referenceDate, c.nextExpected)
      if (daysUntil >= 0 && daysUntil <= 30) {
        upcomingCharges30Days.push({
          merchant: c.merchant,
          date: c.nextExpected,
          amount: c.amount,
          cadence: c.cadence,
        })
      }
    }
  }
  upcomingCharges30Days.sort((a, b) => a.date.localeCompare(b.date))

  const summary: RecurringSummary = {
    candidateCount: activeCandidates.length,
    monthlyCommitment,
    annualCommitment,
    candidates: activeCandidates,
    upcomingCharges30Days,
    reviewStats: {
      totalDetected: allCandidates.length,
      suggestedCount: suggestedCandidates.length,
      confirmedCount: confirmedCandidates.length,
      dismissedCount: dismissedCandidates.length,
    },
  }

  return {
    summary,
    allCandidates,
    activeCandidates,
    confirmedCandidates,
    suggestedCandidates,
    dismissedCandidates,
  }
}
