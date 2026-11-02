import type {
  Transaction,
  SavingsOpportunity,
  SavingsSummary,
  SavingsEvidenceQuality,
  SavingsOpportunityStatus,
  RecurringCandidate,
  AnomalyFinding,
} from '../types/finance'
import { normalizeMerchant } from './transactionFingerprint'
import { detectRecurringPayments } from './recurringDetection'
import { detectSpendingAnomalies } from './anomalyDetection'
import {
  getDeterministicOpportunityKey,
  type SavingsReviewRecord,
} from './savingsStorage'

export interface SavingsAnalysisResult {
  summary: SavingsSummary
  allOpportunities: SavingsOpportunity[]
  activeOpportunities: SavingsOpportunity[]
  plannedOpportunities: SavingsOpportunity[]
  completedOpportunities: SavingsOpportunity[]
  dismissedOpportunities: SavingsOpportunity[]
}

export interface SavingsDetectionOptions {
  referenceDateStr?: string
  recurringCandidates?: RecurringCandidate[]
  anomalyFindings?: AnomalyFinding[]
}

/**
 * Pure, deterministic calculation engine that analyzes canonical transactions,
 * recurring subscriptions, and spending anomalies to generate actionable,
 * evidence-backed savings opportunities.
 *
 * Rules:
 * 1. Honest Estimates: Clearly distinguishes potential savings from realized savings.
 * 2. Conservative Reduction Targets: Modest 10%-15% behavioral trims on discretionary spending.
 * 3. Double-Counting Prevention: Overlapping merchant concentrations and category trims are
 *    netted out rather than blindly summed.
 * 4. Transparent Explanations: Every card cites exact observation counts and base spending.
 */
export function detectSavingsOpportunities(
  transactions: Transaction[],
  reviews: Record<string, SavingsReviewRecord> = {},
  options: SavingsDetectionOptions = {}
): SavingsAnalysisResult {
  // 1. Transaction Eligibility & Guardrails
  if (!Array.isArray(transactions) || transactions.length === 0) {
    const emptySummary: SavingsSummary = {
      activeCount: 0,
      plannedCount: 0,
      completedCount: 0,
      dismissedCount: 0,
      totalPotentialMonthly: 0,
      totalPotentialAnnual: 0,
      plannedMonthlySavings: 0,
      opportunities: [],
    }
    return {
      summary: emptySummary,
      allOpportunities: [],
      activeOpportunities: [],
      plannedOpportunities: [],
      completedOpportunities: [],
      dismissedOpportunities: [],
    }
  }

  // Filter valid expense transactions
  const validExpenses = transactions.filter((t) => {
    if (!t || typeof t !== 'object') return false
    if (t.type !== 'expense') return false
    if (typeof t.amount !== 'number' || t.amount <= 0 || !isFinite(t.amount)) return false
    if (!t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return false
    return true
  })

  // Determine effective reference date
  let referenceDate = options.referenceDateStr
  if (!referenceDate) {
    const dates = validExpenses.map((t) => t.date).sort()
    referenceDate = dates.length > 0 ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10)
  }

  // Filter transactions within preceding 60 days of reference date
  const [refY, refM, refD] = referenceDate.split('-').map(Number)
  const refTime = Date.UTC(refY, refM - 1, refD)

  const recent60dTxs = validExpenses.filter((t) => {
    const [y, m, d] = t.date.split('-').map(Number)
    const tTime = Date.UTC(y, m - 1, d)
    const diffDays = (refTime - tTime) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 60
  })

  const recent30dTxs = recent60dTxs.filter((t) => {
    const [y, m, d] = t.date.split('-').map(Number)
    const tTime = Date.UTC(y, m - 1, d)
    const diffDays = (refTime - tTime) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 30
  })

  const allOpportunities: SavingsOpportunity[] = []
  const categoryTrimsGenerated = new Set<string>()

  // -------------------------------------------------------------
  // RULE 1: Discretionary Category Spending Reduction Targets
  // -------------------------------------------------------------
  const discretionaryCategories = [
    'Food & Dining',
    'Shopping',
    'Entertainment',
    'Personal Care',
    'Lifestyle',
  ]

  // Group 30-day transactions by category
  const categoryMap = new Map<string, Transaction[]>()
  for (const tx of recent30dTxs) {
    const cat = tx.category || 'Other'
    const list = categoryMap.get(cat) || []
    list.push(tx)
    categoryMap.set(cat, list)
  }

  for (const cat of discretionaryCategories) {
    const txs = categoryMap.get(cat) || []
    if (txs.length < 3) continue // Require at least 3 transactions to establish a spending habit

    const totalSpend = txs.reduce((sum, t) => sum + t.amount, 0)
    if (totalSpend < 1200) continue // Minimum monthly spend threshold for meaningful reduction

    // Determine target percentage: 10% for spend >= 6000; 15% for moderate spend
    const targetPercent = totalSpend >= 6000 ? 10 : 15
    const potentialMonthly = Math.round((totalSpend * targetPercent) / 100)
    const potentialAnnual = potentialMonthly * 12
    const evidenceQuality: SavingsEvidenceQuality = txs.length >= 6 ? 'high' : 'moderate'

    const opportunityKey = getDeterministicOpportunityKey('cat', cat)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    categoryTrimsGenerated.add(cat)

    allOpportunities.push({
      id: `opp-cat-${cat.toLowerCase().replace(/[\s&]+/g, '-')}`,
      opportunityKey,
      title: `${targetPercent}% Target for ${cat}`,
      description: `You recorded ₹${Math.round(totalSpend).toLocaleString('en-IN')} across ${txs.length} transactions in ${cat} during the past 30 days. Setting a modest ${targetPercent}% trim target can free up funds without major disruption.`,
      type: 'discretionary_trim',
      category: cat,
      potentialMonthlySavings: potentialMonthly,
      potentialAnnualSavings: potentialAnnual,
      timeBasis: 'monthly',
      evidenceQuality,
      explanation: `Calculated from ₹${Math.round(totalSpend).toLocaleString('en-IN')} historical spend across ${txs.length} transactions.`,
      calculationMethod: `${targetPercent}% reduction target applied to 30-day base spending.`,
      recommendedAction: `Establish a ₹${Math.round(totalSpend - potentialMonthly).toLocaleString('en-IN')} monthly spending ceiling for ${cat}.`,
      status,
      reviewedAt: review?.reviewedAt,
      plannedTargetAmount: potentialMonthly,
      sourceId: cat,
      sourceRecordCount: txs.length,
      currentMonthlySpend: Math.round(totalSpend),
      targetReductionPercent: targetPercent,
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // RULE 2: Reviewable Recurring Payments & Subscriptions
  // -------------------------------------------------------------
  const activeRecurring =
    options.recurringCandidates ??
    detectRecurringPayments(transactions, {}, referenceDate).activeCandidates

  // Exclude non-discretionary commitments (Housing, Rent, Tuition, Basic Utilities)
  const nonDiscretionaryTerms = ['rent', 'hostel', 'tuition', 'fee', 'electricity', 'water']

  for (const cand of activeRecurring) {
    const merchantLower = cand.merchant.toLowerCase()
    const isNonDiscretionary = nonDiscretionaryTerms.some((term) => merchantLower.includes(term))
    if (isNonDiscretionary) continue

    // Propose an audit/review opportunity
    const monthlyCost = cand.monthlyEquivalent
    if (monthlyCost <= 0) continue

    const opportunityKey = getDeterministicOpportunityKey('rec', cand.candidateKey)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    const evidenceQuality: SavingsEvidenceQuality =
      cand.occurrenceCount >= 3 && cand.confidence >= 0.85 ? 'high' : 'moderate'

    allOpportunities.push({
      id: `opp-rec-${cand.candidateKey}`,
      opportunityKey,
      title: `Review ${cand.merchant} Subscription`,
      description: `Detected an ongoing ${cand.cadence.toLowerCase()} charge averaging ₹${Math.round(cand.amount).toLocaleString('en-IN')}. If this service is underutilized, pausing, cancelling, or tier-downgrading can save up to ₹${monthlyCost.toLocaleString('en-IN')}/mo.`,
      type: 'recurring_review',
      category: cand.category || 'Digital Services',
      potentialMonthlySavings: monthlyCost,
      potentialAnnualSavings: cand.annualEquivalent,
      timeBasis: 'monthly',
      evidenceQuality,
      explanation: `Identified ${cand.occurrenceCount} repeat billing occurrences (${cand.cadence}).`,
      calculationMethod: `Potential monthly cost equivalent (₹${monthlyCost}/mo) if cancelled or downgraded.`,
      recommendedAction: `Audit personal usage frequency for ${cand.merchant} and cancel or split if underused.`,
      status,
      reviewedAt: review?.reviewedAt,
      plannedTargetAmount: monthlyCost,
      sourceId: cand.candidateKey,
      sourceRecordCount: cand.occurrenceCount,
      currentMonthlySpend: monthlyCost,
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // RULE 3: Convenience Merchant Concentration & Batching
  // -------------------------------------------------------------
  // Detect merchants with high 30-day frequency (>= 4 orders)
  const merchantGroups = new Map<string, Transaction[]>()
  for (const tx of recent30dTxs) {
    const norm = normalizeMerchant(tx.description)
    if (!norm) continue
    const list = merchantGroups.get(norm) || []
    list.push(tx)
    merchantGroups.set(norm, list)
  }

  for (const [normMerchant, txs] of merchantGroups.entries()) {
    if (txs.length < 4) continue // High frequency threshold

    const totalSpend = txs.reduce((sum, t) => sum + t.amount, 0)
    if (totalSpend < 1000) continue

    const displayName = txs[0].description
    const category = txs[0].category || 'Food & Dining'

    // Conservative fee savings: estimated ~₹40 per order by batching orders into weekly schedules
    const savedDeliveries = Math.max(2, txs.length - Math.ceil(txs.length / 2))
    const estimatedSavings = Math.min(Math.round(totalSpend * 0.12), savedDeliveries * 40)
    if (estimatedSavings < 50) continue

    const opportunityKey = getDeterministicOpportunityKey('merch', normMerchant)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    allOpportunities.push({
      id: `opp-merch-${normMerchant.replace(/\s+/g, '-')}`,
      opportunityKey,
      title: `Batch ${displayName} Orders`,
      description: `You placed ${txs.length} separate orders with ${displayName} totaling ₹${Math.round(totalSpend).toLocaleString('en-IN')}. Combining orders into 1-2 weekly batches cuts repetitive delivery surcharges and convenience fees.`,
      type: 'merchant_concentration',
      category,
      potentialMonthlySavings: estimatedSavings,
      potentialAnnualSavings: estimatedSavings * 12,
      timeBasis: 'monthly',
      evidenceQuality: txs.length >= 6 ? 'high' : 'moderate',
      explanation: `${txs.length} orders recorded in past 30 days totaling ₹${Math.round(totalSpend).toLocaleString('en-IN')}.`,
      calculationMethod: `Estimated ₹40 surcharge and delivery fee savings across ${savedDeliveries} batched orders.`,
      recommendedAction: `Consolidate frequent individual orders into scheduled bulk deliveries.`,
      status,
      reviewedAt: review?.reviewedAt,
      plannedTargetAmount: estimatedSavings,
      sourceId: normMerchant,
      sourceRecordCount: txs.length,
      currentMonthlySpend: Math.round(totalSpend),
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // RULE 4: High-Severity Spending Anomaly Follow-Up
  // -------------------------------------------------------------
  const activeAnomalies =
    options.anomalyFindings ??
    detectSpendingAnomalies(transactions, {}, { referenceDateStr: referenceDate }).activeFindings

  for (const anom of activeAnomalies) {
    if (anom.severity !== 'high' && anom.severity !== 'medium') continue
    if (anom.absoluteDeviation < 1000) continue

    const opportunityKey = getDeterministicOpportunityKey('anom', anom.transactionId)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    allOpportunities.push({
      id: `opp-anom-${anom.transactionId}`,
      opportunityKey,
      title: `Audit Outlier at ${anom.merchant}`,
      description: `A one-off outflow of ₹${Math.round(anom.amount).toLocaleString('en-IN')} was ${anom.ratio}x higher than your typical baseline of ₹${Math.round(anom.baselineAmount).toLocaleString('en-IN')}. Review invoice details to verify no duplicate billing or unintended recurring auto-renewal occurred.`,
      type: 'anomaly_remediation',
      category: anom.category,
      // Honest representation: One-time anomalies do NOT create ongoing monthly recurring savings.
      // Potential monthly savings is 0 to avoid false inflation of monthly recurring savings.
      potentialMonthlySavings: 0,
      potentialAnnualSavings: Math.round(anom.absoluteDeviation),
      timeBasis: 'annual',
      evidenceQuality: anom.evidenceQuality,
      explanation: `Deviation of +₹${Math.round(anom.absoluteDeviation).toLocaleString('en-IN')} above baseline on ${anom.date}.`,
      calculationMethod: `One-time forensic audit. Excluded from monthly recurring aggregates to prevent false inflation.`,
      recommendedAction: `Inspect receipt and verify card statement for possible billing discrepancy.`,
      status,
      reviewedAt: review?.reviewedAt,
      sourceId: anom.transactionId,
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // Deterministic Sorting & Review Grouping
  // -------------------------------------------------------------
  // Rank by status priority: planned/saved first, then suggested, then completed, then dismissed
  const statusRank: Record<SavingsOpportunityStatus, number> = {
    planned: 4,
    saved: 3,
    suggested: 2,
    completed: 1,
    dismissed: 0,
  }

  allOpportunities.sort((a, b) => {
    const rankDiff = statusRank[b.status] - statusRank[a.status]
    if (rankDiff !== 0) return rankDiff
    return b.potentialMonthlySavings - a.potentialMonthlySavings
  })

  const activeOpportunities = allOpportunities.filter((o) => o.status !== 'dismissed')
  const plannedOpportunities = allOpportunities.filter(
    (o) => o.status === 'planned' || o.status === 'saved'
  )
  const completedOpportunities = allOpportunities.filter((o) => o.status === 'completed')
  const dismissedOpportunities = allOpportunities.filter((o) => o.status === 'dismissed')

  // -------------------------------------------------------------
  // Double-Counting Safe Total Calculation
  // -------------------------------------------------------------
  // When summing totalPotentialMonthly:
  // - Category trims are mutually disjoint (distinct categories).
  // - Merchant concentrations in a category already trimmed are netted to prevent double-counting.
  // - Recurring subscriptions are distinct services.
  let totalPotentialMonthly = 0
  const countedCategories = new Set<string>()

  for (const opp of activeOpportunities) {
    if (opp.type === 'discretionary_trim') {
      totalPotentialMonthly += opp.potentialMonthlySavings
      countedCategories.add(opp.category)
    } else if (opp.type === 'recurring_review') {
      totalPotentialMonthly += opp.potentialMonthlySavings
    } else if (opp.type === 'merchant_concentration') {
      // If the merchant's category was already trimmed, don't add the concentration again
      if (!countedCategories.has(opp.category)) {
        totalPotentialMonthly += opp.potentialMonthlySavings
      }
    }
  }

  const plannedMonthlySavings = plannedOpportunities.reduce(
    (sum, o) => sum + (o.plannedTargetAmount ?? o.potentialMonthlySavings),
    0
  )

  const topOpportunity = activeOpportunities.find((o) => o.potentialMonthlySavings > 0)

  const summary: SavingsSummary = {
    activeCount: activeOpportunities.length,
    plannedCount: plannedOpportunities.length,
    completedCount: completedOpportunities.length,
    dismissedCount: dismissedOpportunities.length,
    totalPotentialMonthly,
    totalPotentialAnnual: totalPotentialMonthly * 12,
    plannedMonthlySavings,
    opportunities: activeOpportunities,
    topOpportunity,
    totalIdentifiedMonthly: totalPotentialMonthly,
  }

  return {
    summary,
    allOpportunities,
    activeOpportunities,
    plannedOpportunities,
    completedOpportunities,
    dismissedOpportunities,
  }
}
