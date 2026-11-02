export interface NavItem {
  label: string
  href: string
}

export interface PreviewTransaction {
  id: string
  merchant: string
  category: string
  date: string
  amount: number // in INR (₹)
  amountInCents?: number // backward compatibility
  type: 'income' | 'expense'
  status: 'verified' | 'flagged' | 'recurring' | 'normal' | 'regular' | 'anomaly'
  evidence?: string
}

export interface RecurringFinding {
  id: string
  merchant: string
  cadence: 'Monthly' | 'Annual' | 'Weekly'
  amount: number // in INR (₹)
  amountInCents?: number
  confidence: number
  intervalDays: number
  lastBilled: string
  status: 'Candidate' | 'Confirmed'
}

export interface AnomalyFinding {
  id: string
  merchant: string
  amount: number // in INR (₹)
  amountInCents?: number
  baselineAmount: number // in INR (₹)
  baselineInCents?: number
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
  monthlySavings: number // in INR (₹)
  sixMonthTotal: number // in INR (₹)
  annualTotal: number // in INR (₹)
  monthlySavingsInCents?: number
  sixMonthTotalInCents?: number
  annualTotalInCents?: number
}
