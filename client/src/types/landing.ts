export interface NavItem {
  label: string
  href: string
}

export interface PreviewTransaction {
  id: string
  merchant: string
  category: string
  date: string
  amountInCents: number
  type: 'income' | 'expense'
  status: 'verified' | 'flagged' | 'recurring' | 'regular'
}

export interface RecurringFinding {
  id: string
  merchant: string
  cadence: 'Monthly' | 'Annual' | 'Weekly'
  amountInCents: number
  confidence: number
  intervalDays: number
  lastBilled: string
  status: 'Candidate' | 'Confirmed'
}

export interface AnomalyFinding {
  id: string
  merchant: string
  amountInCents: number
  baselineInCents: number
  ratio: number
  category: string
  reason: string
  severity: 'low' | 'medium' | 'high'
  date: string
}

export interface SavingsScenario {
  id: string
  title: string
  description: string
  category: string
  defaultCutPercent: number
  monthlySavingsInCents: number
  sixMonthTotalInCents: number
  annualTotalInCents: number
}
