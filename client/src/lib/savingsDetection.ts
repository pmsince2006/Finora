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
 * Finora Pure Deterministic Savings Detection Engine
 * 
 * Currency Invariant:
 * The canonical Finora ledger schema defines `amount` exclusively in Indian Rupees (INR, ₹).
 * Non-numeric, non-finite, zero, and negative amounts are strictly excluded.
 * 
 * Core Financial Integrity Principles:
 * 1. Potential vs. Realized Savings:
 *    - Potential savings represent data-backed opportunities to reduce discretionary outflows.
 *    - Realized savings are NOT claimed automatically; marking an opportunity complete records a user-reported milestone.
 * 2. Conservative, Uniform Reduction Targets:
 *    - Discretionary category trims apply a uniform, defensible 10% behavioral reduction target.
 *    - Qualifying threshold: At least 3 transactions and total 30-day spend >= ₹1,500.
 * 3. No Unsupported Fee Fabrications:
 *    - Bank transaction records do not itemize delivery fees or platform surcharges.
 *    - Merchant concentration recommendations provide behavioral ordering insights with ₹0 claimed fee avoidance.
 * 4. Observed Recurring Outflows != Guaranteed Savings:
 *    - Subscriptions are active commitments (₹X/mo). Because Finora does not know if a subscription is unwanted,
 *      its full cost is NOT automatically added to evidence-backed potential savings totals.
 *    - It is presented as an audit review recommendation displaying the observed recurring cost.
 * 5. Double-Counting Prevention:
 *    - Total potential monthly savings aggregates only mutually disjoint discretionary category trims.
 *    - Merchant concentrations, anomalies, and unreviewed subscriptions cannot inflate the aggregate total.
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

  // Filter valid expense transactions: positive finite INR amounts with canonical ISO date YYYY-MM-DD
  const validExpenses = transactions.filter((t) => {
    if (!t || typeof t !== 'object') return false
    if (t.type !== 'expense') return false
    if (typeof t.amount !== 'number' || t.amount <= 0 || !isFinite(t.amount)) return false
    if (!t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return false
    return true
  })

  // Determine effective reference date (defaults to latest valid transaction date or today)
  let referenceDate = options.referenceDateStr
  if (!referenceDate) {
    const dates = validExpenses.map((t) => t.date).sort()
    referenceDate = dates.length > 0 ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10)
  }

  // Filter transactions strictly within preceding 30 days of reference date (inclusive, no future contamination)
  const [refY, refM, refD] = referenceDate.split('-').map(Number)
  const refTime = Date.UTC(refY, refM - 1, refD)

  const recent30dTxs = validExpenses.filter((t) => {
    const [y, m, d] = t.date.split('-').map(Number)
    const tTime = Date.UTC(y, m - 1, d)
    const diffDays = (refTime - tTime) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 30
  })

  const allOpportunities: SavingsOpportunity[] = []

  // -------------------------------------------------------------
  // RULE 1: Discretionary Category Spending Reduction Targets
  // -------------------------------------------------------------
  // Discretionary categories where personal spending adjustments are realistic
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

  // Uniform, defensible 10% reduction target
  const UNIFORM_TARGET_PERCENT = 10
  const MIN_CATEGORY_SPEND_INR = 1500
  const MIN_CATEGORY_TX_COUNT = 3

  for (const cat of discretionaryCategories) {
    const txs = categoryMap.get(cat) || []
    if (txs.length < MIN_CATEGORY_TX_COUNT) continue

    const totalSpend = txs.reduce((sum, t) => sum + t.amount, 0)
    if (totalSpend < MIN_CATEGORY_SPEND_INR) continue

    const potentialMonthly = Math.round((totalSpend * UNIFORM_TARGET_PERCENT) / 100)
    const potentialAnnual = potentialMonthly * 12
    const evidenceQuality: SavingsEvidenceQuality = txs.length >= 6 ? 'high' : 'moderate'

    const opportunityKey = getDeterministicOpportunityKey('cat', cat)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    allOpportunities.push({
      id: `opp-cat-${cat.toLowerCase().replace(/[\s&]+/g, '-')}`,
      opportunityKey,
      title: `${UNIFORM_TARGET_PERCENT}% Target for ${cat}`,
      description: `You spent ₹${Math.round(totalSpend).toLocaleString('en-IN')} across ${txs.length} transactions in ${cat} during the past 30 days. Setting a modest ${UNIFORM_TARGET_PERCENT}% trim target can free up funds without drastic lifestyle shifts.`,
      type: 'discretionary_trim',
      category: cat,
      potentialMonthlySavings: potentialMonthly,
      potentialAnnualSavings: potentialAnnual,
      timeBasis: 'monthly',
      evidenceQuality,
      explanation: `Calculated from ₹${Math.round(totalSpend).toLocaleString('en-IN')} historical 30-day spend across ${txs.length} transactions.`,
      calculationMethod: `${UNIFORM_TARGET_PERCENT}% uniform reduction target applied to 30-day discretionary spending.`,
      recommendedAction: `Establish a ₹${Math.round(totalSpend - potentialMonthly).toLocaleString('en-IN')} monthly spending ceiling for ${cat}.`,
      status,
      reviewedAt: review?.reviewedAt,
      plannedTargetAmount: potentialMonthly,
      sourceId: cat,
      sourceRecordCount: txs.length,
      currentMonthlySpend: Math.round(totalSpend),
      targetReductionPercent: UNIFORM_TARGET_PERCENT,
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // RULE 2: Reviewable Recurring Payments & Subscriptions
  // -------------------------------------------------------------
  // Detect active recurring candidates or accept precomputed candidates
  const activeRecurring =
    options.recurringCandidates ??
    detectRecurringPayments(transactions, {}, referenceDate).activeCandidates

  // Exclude essential living expenses (Housing, Rent, Tuition, Electricity, Water)
  const nonDiscretionaryTerms = ['rent', 'hostel', 'tuition', 'fee', 'electricity', 'water']

  for (const cand of activeRecurring) {
    const merchantLower = cand.merchant.toLowerCase()
    const isNonDiscretionary = nonDiscretionaryTerms.some((term) => merchantLower.includes(term))
    if (isNonDiscretionary) continue

    const monthlyCost = cand.monthlyEquivalent
    if (monthlyCost <= 0) continue

    const opportunityKey = getDeterministicOpportunityKey('rec', cand.candidateKey)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    const evidenceQuality: SavingsEvidenceQuality =
      cand.occurrenceCount >= 3 && cand.confidence >= 0.85 ? 'high' : 'moderate'

    // Honest Accounting Principle:
    // The recurring payment's total cost is NOT automatically counted as evidence-backed potential savings.
    // It is presented as an audit review recommendation displaying the observed recurring cost.
    allOpportunities.push({
      id: `opp-rec-${cand.candidateKey}`,
      opportunityKey,
      title: `Review ${cand.merchant} Subscription`,
      description: `Detected an ongoing ${cand.cadence.toLowerCase()} charge averaging ₹${Math.round(cand.amount).toLocaleString('en-IN')}. Review whether this plan is actively used or if it can be paused, shared, or downgraded.`,
      type: 'recurring_review',
      category: cand.category || 'Digital Services',
      // Baseline potential savings is 0 to avoid false inflation of evidence-backed totals
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
      timeBasis: 'monthly',
      evidenceQuality,
      explanation: `Observed ${cand.occurrenceCount} recurring charges (${cand.cadence}) totaling ₹${monthlyCost.toLocaleString('en-IN')}/mo in commitments.`,
      calculationMethod: `Subscription audit recommendation. Actual savings depend on whether you decide to cancel, downgrade, or retain the service.`,
      recommendedAction: `Audit usage frequency for ${cand.merchant} and cancel or downgrade tier if underutilized.`,
      status,
      reviewedAt: review?.reviewedAt,
      // If user plans it, default target is the monthly cost
      plannedTargetAmount: monthlyCost,
      sourceId: cand.candidateKey,
      sourceRecordCount: cand.occurrenceCount,
      currentMonthlySpend: monthlyCost,
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // RULE 3: Convenience Merchant Concentration & Ordering Habits
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

    const opportunityKey = getDeterministicOpportunityKey('merch', normMerchant)
    const review = reviews[opportunityKey]

    let status: SavingsOpportunityStatus = 'suggested'
    if (review?.status) status = review.status

    // Honest Accounting Principle:
    // Delivery fees, tips, and platform fees are NOT broken out in bank transaction data.
    // Rather than assuming an arbitrary ₹40 fee per order, we provide a behavioral habit insight
    // with ₹0 claimed potential savings to prevent speculative savings claims.
    allOpportunities.push({
      id: `opp-merch-${normMerchant.replace(/\s+/g, '-')}`,
      opportunityKey,
      title: `Batch ${displayName} Orders`,
      description: `You placed ${txs.length} separate orders with ${displayName} totaling ₹${Math.round(totalSpend).toLocaleString('en-IN')} in the past 30 days. Consolidating orders into weekly schedules reduces order frequency and delivery overhead.`,
      type: 'merchant_concentration',
      category,
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
      timeBasis: 'monthly',
      evidenceQuality: txs.length >= 6 ? 'high' : 'moderate',
      explanation: `${txs.length} separate orders recorded in past 30 days totaling ₹${Math.round(totalSpend).toLocaleString('en-IN')}.`,
      calculationMethod: `Behavioral frequency insight. Delivery and surcharge fees are not itemized in bank transaction data, so no speculative monetary saving is claimed.`,
      recommendedAction: `Batch frequent individual orders into scheduled consolidated orders.`,
      status,
      reviewedAt: review?.reviewedAt,
      plannedTargetAmount: 0,
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

    // Honest Accounting Principle:
    // One-time anomalies do NOT create ongoing monthly savings.
    // We treat this as a forensic audit check (potentialMonthlySavings = 0).
    allOpportunities.push({
      id: `opp-anom-${anom.transactionId}`,
      opportunityKey,
      title: `Audit Outlier at ${anom.merchant}`,
      description: `A one-off outflow of ₹${Math.round(anom.amount).toLocaleString('en-IN')} was ${anom.ratio}x higher than your typical baseline of ₹${Math.round(anom.baselineAmount).toLocaleString('en-IN')}. Verify receipt to ensure no duplicate billing or unintended auto-renewal occurred.`,
      type: 'anomaly_remediation',
      category: anom.category,
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
      timeBasis: 'annual',
      evidenceQuality: anom.evidenceQuality,
      explanation: `Deviation of +₹${Math.round(anom.absoluteDeviation).toLocaleString('en-IN')} above baseline on ${anom.date}.`,
      calculationMethod: `One-time invoice review. Excluded from monthly recurring aggregates to prevent false inflation.`,
      recommendedAction: `Inspect receipt and verify card statement for possible billing discrepancy.`,
      status,
      reviewedAt: review?.reviewedAt,
      sourceId: anom.transactionId,
      userNotes: review?.userNotes,
    })
  }

  // -------------------------------------------------------------
  // Deterministic Sorting & Status Grouping
  // -------------------------------------------------------------
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
    // Secondary sort: highest potential monthly savings, then highest current monthly spend
    const savingsDiff = b.potentialMonthlySavings - a.potentialMonthlySavings
    if (savingsDiff !== 0) return savingsDiff
    return (b.currentMonthlySpend ?? 0) - (a.currentMonthlySpend ?? 0)
  })

  const activeOpportunities = allOpportunities.filter((o) => o.status !== 'dismissed')
  const plannedOpportunities = allOpportunities.filter(
    (o) => o.status === 'planned' || o.status === 'saved'
  )
  const completedOpportunities = allOpportunities.filter((o) => o.status === 'completed')
  const dismissedOpportunities = allOpportunities.filter((o) => o.status === 'dismissed')

  // -------------------------------------------------------------
  // Guaranteed Double-Counting-Free Aggregations
  // -------------------------------------------------------------
  // Total potential monthly savings sums ONLY mutually disjoint category trims.
  // Each category is mutually exclusive, guaranteeing that the same rupee is never counted twice.
  let totalPotentialMonthly = 0
  const countedCategories = new Set<string>()

  for (const opp of activeOpportunities) {
    if (opp.type === 'discretionary_trim' && opp.potentialMonthlySavings > 0) {
      if (!countedCategories.has(opp.category)) {
        totalPotentialMonthly += opp.potentialMonthlySavings
        countedCategories.add(opp.category)
      }
    }
  }

  // User-planned monthly commitments: sum of planned opportunities where user explicitly committed
  const plannedMonthlySavings = plannedOpportunities.reduce((sum, o) => {
    if (o.status === 'planned') {
      return sum + (o.plannedTargetAmount ?? o.potentialMonthlySavings)
    }
    return sum
  }, 0)

  // Top opportunity is the active opportunity with the highest quantifiable potential savings
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
