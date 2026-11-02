export type TransactionType = 'income' | 'expense'

export type TransactionStatus = 'verified' | 'flagged' | 'recurring' | 'regular'

export type AnomalySeverity = 'low' | 'medium' | 'high'

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
  merchant: string
  category: string
  amount: number
  baselineAmount: number
  ratio: number
  severity: AnomalySeverity
  reason: string
  date: string
}

export interface AnomalySummary {
  reviewableCount: number
  spikesTotal: number
  findings: AnomalyFinding[]
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

export interface SavingsSummary {
  topOpportunity: SavingsScenario
  totalIdentifiedMonthly: number
  scenarios: SavingsScenario[]
}
