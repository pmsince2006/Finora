export type TransactionType = 'income' | 'expense'

export type TransactionStatus = 'verified' | 'flagged' | 'recurring' | 'regular'

export type AnomalySeverity = 'low' | 'medium' | 'high'

export type AnomalyEvidenceQuality = 'high' | 'moderate' | 'preliminary'

export type AnomalyReviewStatus = 'active' | 'reviewed' | 'dismissed'

export type AnomalyBaselineMethod = 'merchant' | 'category' | 'personal'

export type RecurringCadence =
  | 'Weekly'
  | 'Fortnightly'
  | 'Monthly'
  | 'Quarterly'
  | 'Annually'
  | 'Irregular / Uncertain'
  | 'Annual'

export type ReviewStatus = 'suggested' | 'confirmed' | 'dismissed'

export type AmountVariability = 'exact' | 'low' | 'moderate' | 'high'

export type CadenceConsistency = 'regular' | 'moderate' | 'irregular'

export interface Transaction {
  id: string
  description: string
  amount: number // in INR (positive integer or float)
  type: TransactionType
  category: string
  date: string // ISO 'YYYY-MM-DD'
  notes?: string
  account?: string
  status?: TransactionStatus
  isRecurringCandidate?: boolean
  recurringCadence?: RecurringCadence
  confidence?: number
  isAnomaly?: boolean
  anomalySeverity?: AnomalySeverity
  anomalyReason?: string
  baselineAmount?: number
}

export type PeriodFilter = '30D' | '60D' | '90D' | 'THIS_MONTH' | 'ALL'

export interface SummaryMetrics {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  potentialMonthlySavings: number
  incomeCount: number
  expenseCount: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface SpendingTrendPoint {
  date: string
  label: string
  income: number
  expenses: number
  baseline: number
  net: number
}

export interface UpcomingCharge {
  merchant: string
  date: string
  amount: number
  cadence: RecurringCadence
}

export interface RecurringCandidate {
  id: string
  candidateKey: string
  merchant: string
  category: string
  amount: number
  cadence: RecurringCadence
  confidence: number
  lastBilled: string
  nextExpected: string | null
  status: 'Candidate' | 'Confirmed' | 'Dismissed'
  occurrenceCount: number
  matchingTransactionIds: string[]
  averageAmount: number
  monthlyEquivalent: number
  annualEquivalent: number
  amountVariability: AmountVariability
  cadenceConsistency: CadenceConsistency
  explanation: string
  reviewStatus: ReviewStatus
  reviewedAt?: string
}

export interface RecurringSummary {
  candidateCount: number
  monthlyCommitment: number
  annualCommitment: number
  candidates: RecurringCandidate[]
  upcomingCharges30Days?: UpcomingCharge[]
  reviewStats?: {
    totalDetected: number
    suggestedCount: number
    confirmedCount: number
    dismissedCount: number
  }
}

export interface AnomalyFinding {
  id: string
  findingKey: string
  transactionId: string
  merchant: string
  category: string
  amount: number
  baselineAmount: number
  ratio: number
  severity: AnomalySeverity
  reason: string
  date: string
  // Phase 05 extensions
  absoluteDeviation: number
  evidenceQuality: AnomalyEvidenceQuality
  sampleCount: number
  baselineMethod: AnomalyBaselineMethod
  comparableTransactionIds: string[]
  ruleId?: string
  reviewStatus: AnomalyReviewStatus
  reviewedAt?: string
  userNotes?: string
  // Statistical details for forensic inspection
  stats?: {
    mean: number
    median: number
    stdDev: number
    mad: number
    windowDays: number
  }
}

export interface AnomalySummary {
  reviewableCount: number
  spikesTotal: number
  findings: AnomalyFinding[]
  // Phase 05 extensions
  highSeverityCount?: number
  reviewedCount?: number
  dismissedCount?: number
  totalDetected?: number
  categoriesAffected?: number
}

export interface SavingsScenario {
  id: string
  title: string
  description: string
  category: string
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  effort: 'Low' | 'Medium' | 'High'
  impact: 'High' | 'Moderate'
}

export type SavingsOpportunityType =
  | 'recurring_review'
  | 'discretionary_trim'
  | 'merchant_concentration'
  | 'anomaly_remediation'

export type SavingsEvidenceQuality = 'high' | 'moderate' | 'preliminary'

export type SavingsOpportunityStatus =
  | 'suggested'
  | 'saved'
  | 'planned'
  | 'completed'
  | 'dismissed'

export interface SavingsOpportunity {
  id: string
  opportunityKey: string
  title: string
  description: string
  type: SavingsOpportunityType
  category: string
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  timeBasis: 'monthly' | 'annual'
  evidenceQuality: SavingsEvidenceQuality
  explanation: string
  calculationMethod: string
  recommendedAction: string
  status: SavingsOpportunityStatus
  reviewedAt?: string
  plannedTargetAmount?: number
  sourceId?: string
  sourceRecordCount?: number
  currentMonthlySpend?: number
  targetReductionPercent?: number
  userNotes?: string
}

export interface SavingsSummary {
  activeCount: number
  plannedCount: number
  completedCount: number
  dismissedCount: number
  totalPotentialMonthly: number
  totalPotentialAnnual: number
  plannedMonthlySavings: number
  opportunities: SavingsOpportunity[]
  topOpportunity?: SavingsOpportunity
  // Backwards compatibility for legacy components
  totalIdentifiedMonthly?: number
  scenarios?: SavingsScenario[]
}
