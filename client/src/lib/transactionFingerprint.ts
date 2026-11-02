import type { Transaction } from '../types/finance'

/**
 * Normalizes a merchant or description string for deterministic comparison.
 * - Trims external whitespace
 * - Converts to lower-case
 * - Collapses consecutive whitespace into a single space
 * - Strips common noisy prefixes/suffixes (e.g., UPI reference codes or punctuation artifacts)
 *   while preserving semantic tokens.
 */
export function normalizeMerchant(desc: string): string {
  if (!desc) return ''
  return desc
    .toLowerCase()
    .trim()
    // Replace punctuation with spaces to treat "Swiggy - Food" and "Swiggy Food" equally
    .replace(/[^\w\s]/g, ' ')
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalizes a transaction date into canonical YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return trimmed
}

/**
 * Normalizes a numeric amount to a canonical 2-decimal string.
 */
export function normalizeAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return rounded.toFixed(2)
}

/**
 * Generates a deterministic compound fingerprint for a transaction.
 * Format: `<YYYY-MM-DD>|<normalized_merchant>|<normalized_amount>`
 */
export function createTransactionFingerprint(tx: {
  date: string
  description: string
  amount: number
}): string {
  const normDate = normalizeDate(tx.date)
  const normMerchant = normalizeMerchant(tx.description)
  const normAmount = normalizeAmount(tx.amount)
  return `${normDate}|${normMerchant}|${normAmount}`
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  duplicateType?: 'existing' | 'batch_internal'
  duplicateReason?: string
  matchingTxId?: string
}

/**
 * Checks a candidate list of transactions against existing transactions and intra-batch duplicates.
 */
export function checkDuplicates(
  existingTransactions: Transaction[],
  candidates: Array<{ date: string; description: string; amount: number; id?: string }>
): DuplicateCheckResult[] {
  // Map of fingerprint -> existing transaction ID
  const existingMap = new Map<string, string>()
  for (const tx of existingTransactions) {
    const fp = createTransactionFingerprint(tx)
    if (!existingMap.has(fp)) {
      existingMap.set(fp, tx.id)
    }
  }

  // Set to track fingerprints seen within the incoming candidate batch
  const seenInBatch = new Set<string>()

  return candidates.map((cand) => {
    const fp = createTransactionFingerprint(cand)

    // Check if fingerprint matches an already stored transaction
    if (existingMap.has(fp)) {
      const matchId = existingMap.get(fp)
      return {
        isDuplicate: true,
        duplicateType: 'existing',
        duplicateReason: `Matches existing transaction in ledger (${normalizeDate(cand.date)} • ₹${normalizeAmount(cand.amount)})`,
        matchingTxId: matchId,
      }
    }

    // Check if duplicate of an earlier item in the same batch
    if (seenInBatch.has(fp)) {
      return {
        isDuplicate: true,
        duplicateType: 'batch_internal',
        duplicateReason: `Duplicate entry within the same CSV file (${normalizeDate(cand.date)} • ₹${normalizeAmount(cand.amount)})`,
      }
    }

    seenInBatch.add(fp)
    return {
      isDuplicate: false,
    }
  })
}
