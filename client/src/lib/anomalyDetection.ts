import type {
  Transaction,
  AnomalyFinding,
  AnomalySummary,
  AnomalySeverity,
  AnomalyEvidenceQuality,
  AnomalyBaselineMethod,
  AnomalyReviewStatus,
} from '../types/finance'
import { normalizeMerchant } from './transactionFingerprint'
import { addDays } from './recurringDetection'
import {
  getDeterministicFindingKey,
  type AnomalyReviewRecord,
} from './anomalyStorage'

export interface AnomalyDetectionOptions {
  windowDays?: number // Default: 60 days
  minHistorySamples?: number // Default: 3 samples
  highSeverityRatioThreshold?: number // Default: 3.0
  mediumSeverityRatioThreshold?: number // Default: 2.0
  lowSeverityRatioThreshold?: number // Default: 1.6
  minRupeeDeviationHigh?: number // Default: 1500
  minRupeeDeviationMedium?: number // Default: 800
  minRupeeDeviationLow?: number // Default: 400
  referenceDateStr?: string // Current anchor date
}

export interface AnomalyAnalysisResult {
  summary: AnomalySummary
  allFindings: AnomalyFinding[]
  activeFindings: AnomalyFinding[]
  reviewedFindings: AnomalyFinding[]
  dismissedFindings: AnomalyFinding[]
}

/**
 * Calculates the arithmetic mean of an array of numbers.
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, v) => acc + v, 0)
  return sum / values.length
}

/**
 * Calculates the median of an array of numbers.
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Calculates sample standard deviation (Bessel's correction n-1).
 */
export function calculateStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0
  const m = mean !== undefined ? mean : calculateMean(values)
  const variance = values.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/**
 * Calculates Median Absolute Deviation (MAD) and robust scale estimator (1.4826 * MAD).
 */
export function calculateMad(values: number[], median?: number): { mad: number; robustSigma: number } {
  if (values.length === 0) return { mad: 0, robustSigma: 0 }
  const med = median !== undefined ? median : calculateMedian(values)
  const deviations = values.map((v) => Math.abs(v - med))
  const mad = calculateMedian(deviations)
  const robustSigma = 1.4826 * mad
  return { mad, robustSigma }
}

/**
 * Generates an informative, transparent, beginner-friendly explanation.
 */
function generateAnomalyExplanation(params: {
  merchant: string
  category: string
  amount: number
  baselineAmount: number
  ratio: number
  baselineMethod: AnomalyBaselineMethod
  sampleCount: number
}): string {
  const { category, amount, baselineAmount, ratio, baselineMethod, sampleCount } = params
  const formattedAmt = `₹${Math.round(amount).toLocaleString('en-IN')}`
  const formattedBaseline = `₹${Math.round(baselineAmount).toLocaleString('en-IN')}`

  if (sampleCount < 3) {
    return `Unusual expense of ${formattedAmt} (normally around ${formattedBaseline}), though based on sparse recent history (${sampleCount} observations).`
  }

  if (baselineMethod === 'merchant') {
    return `This purchase of ${formattedAmt} is ${ratio}x higher than your usual spending with this merchant (average ${formattedBaseline}).`
  }

  if (baselineMethod === 'category') {
    return `This purchase of ${formattedAmt} is ${ratio}x your typical spending for ${category} (normally ${formattedBaseline}).`
  }

  return `This outflow of ${formattedAmt} significantly deviates from your typical spending pattern (${ratio}x your baseline of ${formattedBaseline}).`
}

/**
 * Pure, deterministic detection engine analyzing canonical transactions for spending anomalies.
 * Excludes transactions from their own baselines, uses historical rolling windows,
 * and handles zero-variance and sparse data gracefully.
 */
export function detectSpendingAnomalies(
  transactions: Transaction[],
  reviews: Record<string, AnomalyReviewRecord> = {},
  options: AnomalyDetectionOptions = {}
): AnomalyAnalysisResult {
  const windowDays = options.windowDays ?? 60
  const highRatio = options.highSeverityRatioThreshold ?? 3.0
  const medRatio = options.mediumSeverityRatioThreshold ?? 2.0
  const lowRatio = options.lowSeverityRatioThreshold ?? 1.6
  const minDevHigh = options.minRupeeDeviationHigh ?? 1500
  const minDevMed = options.minRupeeDeviationMedium ?? 800
  const minDevLow = options.minRupeeDeviationLow ?? 400

  // 1. Transaction Eligibility Filter
  // Only valid expense transactions with positive finite amounts and valid dates
  if (!Array.isArray(transactions)) {
    return {
      summary: {
        reviewableCount: 0,
        spikesTotal: 0,
        findings: [],
        highSeverityCount: 0,
        reviewedCount: 0,
        dismissedCount: 0,
        totalDetected: 0,
      },
      allFindings: [],
      activeFindings: [],
      reviewedFindings: [],
      dismissedFindings: [],
    }
  }

  const eligible = transactions.filter((t) => {
    if (!t || typeof t !== 'object') return false
    if (t.type !== 'expense') return false
    if (typeof t.amount !== 'number' || t.amount <= 0 || !isFinite(t.amount)) return false
    if (!t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return false
    if (!t.description || !t.description.trim()) return false
    return true
  })

  // Determine effective reference date
  let referenceDate = options.referenceDateStr
  if (!referenceDate) {
    const allDates = eligible.map((t) => t.date).sort()
    referenceDate = allDates.length > 0 ? allDates[allDates.length - 1] : new Date().toISOString().slice(0, 10)
  }

  // Filter out future-dated transactions from evaluation to prevent future contamination
  const validTxs = eligible.filter((t) => t.date <= referenceDate!)

  // Sort chronologically ascending
  const sortedTxs = [...validTxs].sort((a, b) => a.date.localeCompare(b.date))

  const allFindings: AnomalyFinding[] = []

  // 2. Evaluate Each Transaction Against Its Historical Preceding Baseline
  for (let i = 0; i < sortedTxs.length; i++) {
    const evaluatedTx = sortedTxs[i]
    const evalAmount = evaluatedTx.amount
    const evalDate = evaluatedTx.date
    const evalNormMerchant = normalizeMerchant(evaluatedTx.description)
    const evalCategory = evaluatedTx.category
    const windowStartDate = addDays(evalDate, -windowDays)

    // Gather strictly preceding historical transactions within the window
    // (excludes evaluatedTx itself and prevents lookahead bias)
    const precedingInWindow = sortedTxs.filter((t) => {
      if (t.id === evaluatedTx.id) return false
      // Strictly preceding in time or earlier in sequence on same date
      if (t.date > evalDate) return false
      if (t.date === evalDate && sortedTxs.indexOf(t) >= i) return false
      return t.date >= windowStartDate
    })

    // Group candidates for baseline
    const merchantMatches = precedingInWindow.filter(
      (t) => normalizeMerchant(t.description) === evalNormMerchant
    )
    const categoryMatches = precedingInWindow.filter(
      (t) => t.category === evalCategory
    )

    let baselineSample: Transaction[] = []
    let baselineMethod: AnomalyBaselineMethod = 'category'

    // Multi-tier baseline selection
    if (merchantMatches.length >= 3) {
      baselineSample = merchantMatches
      baselineMethod = 'merchant'
    } else if (categoryMatches.length >= 3) {
      baselineSample = categoryMatches
      baselineMethod = 'category'
    } else if (categoryMatches.length > 0) {
      // Sparse category history
      baselineSample = categoryMatches
      baselineMethod = 'category'
    } else if (precedingInWindow.length >= 5) {
      // Fall back to personal discretionary baseline
      baselineSample = precedingInWindow
      baselineMethod = 'personal'
    } else {
      // Insufficient history to form any baseline
      continue
    }

    const sampleAmounts = baselineSample.map((t) => t.amount)
    const sampleCount = sampleAmounts.length

    // Compute statistical metrics
    const mean = calculateMean(sampleAmounts)
    const median = calculateMedian(sampleAmounts)
    const stdDev = calculateStdDev(sampleAmounts, mean)
    const { mad, robustSigma } = calculateMad(sampleAmounts, median)

    // Use robust median as primary baseline, fallback to mean
    const baseline = Math.round(median > 0 ? median : mean)
    if (baseline <= 0) continue

    const absoluteDeviation = Math.round((evalAmount - baseline) * 100) / 100
    const ratio = Math.round((evalAmount / baseline) * 10) / 10

    // Only expenses exceeding baseline can be positive spending anomalies
    if (evalAmount <= baseline) continue

    // Calculate standardized score (Z-Score or robust score)
    let score = 0
    if (robustSigma > 0) {
      score = (evalAmount - median) / robustSigma
    } else if (stdDev > 0) {
      score = (evalAmount - mean) / stdDev
    } else {
      // Zero variance handling (e.g. all previous transactions were exactly identical)
      score = ratio >= 2.0 ? 3.5 : 1.0
    }

    // Determine Severity
    let severity: AnomalySeverity | null = null

    // High Severity Criteria
    if (
      (ratio >= highRatio && absoluteDeviation >= minDevHigh) ||
      (score >= 3.2 && absoluteDeviation >= minDevHigh)
    ) {
      severity = 'high'
    }
    // Medium Severity Criteria
    else if (
      (ratio >= medRatio && absoluteDeviation >= minDevMed) ||
      (score >= 2.2 && absoluteDeviation >= minDevMed)
    ) {
      severity = 'medium'
    }
    // Low Severity Criteria
    else if (
      (ratio >= lowRatio && absoluteDeviation >= minDevLow) ||
      (score >= 1.8 && absoluteDeviation >= minDevLow)
    ) {
      severity = 'low'
    }

    // If thresholds are not reached or absolute deviation is too small, ignore
    if (!severity || absoluteDeviation < 300) continue

    // Determine Evidence Quality
    let evidenceQuality: AnomalyEvidenceQuality = 'moderate'
    if (sampleCount >= 5 && baselineMethod !== 'personal') {
      evidenceQuality = 'high'
    } else if (sampleCount < 3 || baselineMethod === 'personal') {
      evidenceQuality = 'preliminary'
    }

    // Determine specific rule identifier
    let ruleId = 'category_deviation'
    if (baselineMethod === 'merchant') {
      ruleId = 'merchant_deviation'
    } else if (baselineMethod === 'personal') {
      ruleId = 'large_expense'
    }

    // Reconcile with persisted user review decision (supports rule-specific or generic key)
    const findingKey = getDeterministicFindingKey(evaluatedTx.id, ruleId)
    const fallbackKey = getDeterministicFindingKey(evaluatedTx.id)
    const review = reviews[findingKey] || reviews[fallbackKey]

    let reviewStatus: AnomalyReviewStatus = 'active'
    if (review?.status === 'reviewed') {
      reviewStatus = 'reviewed'
    } else if (review?.status === 'dismissed') {
      reviewStatus = 'dismissed'
    }

    // Plain-English beginner explanation
    const reason = generateAnomalyExplanation({
      merchant: evaluatedTx.description,
      category: evaluatedTx.category,
      amount: evalAmount,
      baselineAmount: baseline,
      ratio,
      baselineMethod,
      sampleCount,
    })

    allFindings.push({
      id: findingKey,
      findingKey,
      transactionId: evaluatedTx.id,
      merchant: evaluatedTx.description,
      category: evaluatedTx.category,
      amount: evalAmount,
      baselineAmount: baseline,
      ratio,
      severity,
      reason,
      date: evalDate,
      absoluteDeviation,
      evidenceQuality,
      sampleCount,
      baselineMethod,
      ruleId,
      comparableTransactionIds: baselineSample.map((t) => t.id),
      reviewStatus,
      reviewedAt: review?.reviewedAt,
      userNotes: review?.userNotes,
      stats: {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        mad: Math.round(mad * 100) / 100,
        windowDays,
      },
    })
  }

  // Sort findings by severity descending, then absolute deviation descending
  const severityRank: Record<AnomalySeverity, number> = { high: 3, medium: 2, low: 1 }
  allFindings.sort((a, b) => {
    const sevDiff = severityRank[b.severity] - severityRank[a.severity]
    if (sevDiff !== 0) return sevDiff
    return b.absoluteDeviation - a.absoluteDeviation
  })

  const activeFindings = allFindings.filter((f) => f.reviewStatus === 'active')
  const reviewedFindings = allFindings.filter((f) => f.reviewStatus === 'reviewed')
  const dismissedFindings = allFindings.filter((f) => f.reviewStatus === 'dismissed')

  // Aggregate values without double-counting
  const spikesTotal = activeFindings.reduce((sum, f) => sum + f.amount, 0)
  const highSeverityCount = activeFindings.filter((f) => f.severity === 'high').length
  const categoriesAffected = new Set(activeFindings.map((f) => f.category)).size

  const summary: AnomalySummary = {
    reviewableCount: activeFindings.length,
    spikesTotal,
    findings: activeFindings,
    highSeverityCount,
    reviewedCount: reviewedFindings.length,
    dismissedCount: dismissedFindings.length,
    totalDetected: allFindings.length,
    categoriesAffected,
  }

  return {
    summary,
    allFindings,
    activeFindings,
    reviewedFindings,
    dismissedFindings,
  }
}

export interface CategoryPeriodComparison {
  category: string
  currentSpending: number
  baselineSpending: number
  currentDays: number
  baselineDays: number
  dailyCurrentRate: number
  dailyBaselineRate: number
  rateRatio: number
  isProRated: boolean
  isSurge: boolean
}

/**
 * Compares spending in a category over comparable periods.
 * Normalizes by period length (daily rates) to ensure a partial period
 * is never compared directly against a complete period without adjustment.
 */
export function compareCategoryPeriodSpending(
  transactions: Transaction[],
  category: string,
  referenceDateStr: string,
  currentDays: number = 14,
  baselineDays: number = 30
): CategoryPeriodComparison {
  if (!transactions || !Array.isArray(transactions) || currentDays <= 0 || baselineDays <= 0) {
    return {
      category,
      currentSpending: 0,
      baselineSpending: 0,
      currentDays: Math.max(1, currentDays),
      baselineDays: Math.max(1, baselineDays),
      dailyCurrentRate: 0,
      dailyBaselineRate: 0,
      rateRatio: 1.0,
      isProRated: true,
      isSurge: false,
    }
  }

  const currentStartDate = addDays(referenceDateStr, -currentDays)
  const baselineStartDate = addDays(currentStartDate, -baselineDays)

  let currentSpending = 0
  let baselineSpending = 0

  for (const t of transactions) {
    if (
      !t ||
      typeof t !== 'object' ||
      t.type !== 'expense' ||
      t.category !== category ||
      typeof t.amount !== 'number' ||
      t.amount <= 0 ||
      !isFinite(t.amount) ||
      !t.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(t.date)
    ) {
      continue
    }

    if (t.date > currentStartDate && t.date <= referenceDateStr) {
      currentSpending += t.amount
    } else if (t.date > baselineStartDate && t.date <= currentStartDate) {
      baselineSpending += t.amount
    }
  }

  const dailyCurrentRate = Math.round((currentSpending / currentDays) * 100) / 100
  const dailyBaselineRate = Math.round((baselineSpending / baselineDays) * 100) / 100
  const rateRatio = dailyBaselineRate > 0
    ? Math.round((dailyCurrentRate / dailyBaselineRate) * 10) / 10
    : currentSpending > 0 ? 2.0 : 1.0

  const isSurge = rateRatio >= 1.75 && dailyCurrentRate - dailyBaselineRate >= 200

  return {
    category,
    currentSpending: Math.round(currentSpending),
    baselineSpending: Math.round(baselineSpending),
    currentDays,
    baselineDays,
    dailyCurrentRate,
    dailyBaselineRate,
    rateRatio,
    isProRated: currentDays !== baselineDays,
    isSurge,
  }
}
