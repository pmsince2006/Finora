import type { Transaction, TransactionType } from '../types/finance'
import { DEMO_TRANSACTIONS } from '../data/demoTransactions'

export const STORAGE_KEY = 'finora.transactions.v1'
export const CORRUPT_BACKUP_KEY = 'finora.transactions.v1.corrupt_backup'

/**
 * Creates an immutable deep copy of the demo transaction dataset.
 * Prevents unintended mutation of the seed constants.
 */
export function getFreshDemoTransactions(): Transaction[] {
  return DEMO_TRANSACTIONS.map((tx) => ({ ...tx }))
}

/**
 * Validates whether an unknown value conforms to the canonical Transaction interface.
 */
export function isValidTransaction(item: unknown): item is Transaction {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Record<string, unknown>

  if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
    return false
  }
  if (typeof candidate.description !== 'string' || candidate.description.trim().length === 0) {
    return false
  }
  if (typeof candidate.amount !== 'number' || isNaN(candidate.amount) || !isFinite(candidate.amount) || candidate.amount < 0) {
    return false
  }
  if (candidate.type !== 'income' && candidate.type !== 'expense') {
    return false
  }
  if (typeof candidate.category !== 'string' || candidate.category.trim().length === 0) {
    return false
  }
  if (typeof candidate.date !== 'string' || candidate.date.trim().length === 0) {
    return false
  }
  // Validate that date parses to a real timestamp
  const parsedDate = new Date(candidate.date)
  if (isNaN(parsedDate.getTime())) {
    return false
  }

  return true
}

/**
 * Validates a collection of items loaded from storage.
 * If at least 80% of items are valid or if it is a valid array of transactions,
 * repairs minor gaps or returns the validated array.
 */
export function validateStoredTransactions(raw: unknown): Transaction[] | null {
  if (!Array.isArray(raw)) {
    return null
  }

  const validTransactions: Transaction[] = []
  for (const item of raw) {
    if (isValidTransaction(item)) {
      validTransactions.push({
        id: item.id,
        description: item.description.trim(),
        amount: Math.round(item.amount * 100) / 100,
        type: item.type as TransactionType,
        category: item.category.trim(),
        date: item.date.slice(0, 10),
        notes: typeof item.notes === 'string' ? item.notes : undefined,
        account: typeof item.account === 'string' ? item.account : undefined,
        status: typeof item.status === 'string' ? (item.status as Transaction['status']) : 'regular',
        isRecurringCandidate: Boolean(item.isRecurringCandidate),
        recurringCadence: item.recurringCadence,
        confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
        isAnomaly: Boolean(item.isAnomaly),
        anomalySeverity: item.anomalySeverity,
        anomalyReason: typeof item.anomalyReason === 'string' ? item.anomalyReason : undefined,
        baselineAmount: typeof item.baselineAmount === 'number' ? item.baselineAmount : undefined,
      })
    }
  }

  // If array was empty or valid items were found
  if (raw.length === 0) return []
  if (validTransactions.length === 0) return null

  // If some rows were dropped due to malformation, return valid ones
  return validTransactions
}

/**
 * Safely reads stored transactions from localStorage.
 * Falls back to demo transactions if storage is empty, disabled, or malformed.
 */
export function loadTransactionsFromStorage(): {
  transactions: Transaction[]
  isUsingFallback: boolean
  recoveredFromCorrupt: boolean
} {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { transactions: getFreshDemoTransactions(), isUsingFallback: true, recoveredFromCorrupt: false }
    }

    const rawJson = window.localStorage.getItem(STORAGE_KEY)
    if (!rawJson) {
      // First visit: initialize with demo transactions
      return { transactions: getFreshDemoTransactions(), isUsingFallback: false, recoveredFromCorrupt: false }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawJson)
    } catch {
      // Malformed JSON: back up corrupt data safely without crashing
      window.localStorage.setItem(CORRUPT_BACKUP_KEY, rawJson)
      return { transactions: getFreshDemoTransactions(), isUsingFallback: true, recoveredFromCorrupt: true }
    }

    const validated = validateStoredTransactions(parsed)
    if (!validated) {
      window.localStorage.setItem(CORRUPT_BACKUP_KEY, rawJson)
      return { transactions: getFreshDemoTransactions(), isUsingFallback: true, recoveredFromCorrupt: true }
    }

    return { transactions: validated, isUsingFallback: false, recoveredFromCorrupt: false }
  } catch (err) {
    console.warn('[Finora Storage] Unable to access localStorage, using demo transactions:', err)
    return { transactions: getFreshDemoTransactions(), isUsingFallback: true, recoveredFromCorrupt: false }
  }
}

/**
 * Safely saves transactions to localStorage.
 */
export function saveTransactionsToStorage(transactions: Transaction[]): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const serialized = JSON.stringify(transactions)
    window.localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch (err) {
    console.warn('[Finora Storage] Failed to write transactions to localStorage:', err)
    return false
  }
}

/**
 * Removes stored transactions from localStorage.
 */
export function clearTransactionsStorage(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch (err) {
    console.warn('[Finora Storage] Failed to clear transactions localStorage:', err)
  }
}
