import { normalizeMerchant } from './transactionFingerprint'

export const RECURRING_REVIEWS_STORAGE_KEY = 'finora.recurringReviews.v1'
export const RECURRING_REVIEWS_CORRUPT_BACKUP_KEY = 'finora.recurringReviews.v1.corrupt_backup'

export interface RecurringReviewRecord {
  candidateKey: string
  status: 'confirmed' | 'dismissed'
  reviewedAt: string
  userNotes?: string
}

/**
 * Creates a stable deterministic key for a candidate based on normalized merchant name.
 * e.g., "Cult.fit Gym & Wellness" -> "rec-cult fit gym wellness"
 */
export function getDeterministicCandidateKey(merchant: string): string {
  const norm = normalizeMerchant(merchant)
  return `rec-${norm}`
}

/**
 * Safely loads user review decisions from localStorage.
 * Handles corrupt JSON safely without throwing.
 */
export function loadRecurringReviews(): Record<string, RecurringReviewRecord> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {}
    }

    const raw = window.localStorage.getItem(RECURRING_REVIEWS_STORAGE_KEY)
    if (!raw) return {}

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Backup corrupted string and return safe fallback
      window.localStorage.setItem(RECURRING_REVIEWS_CORRUPT_BACKUP_KEY, raw)
      console.warn('[Finora Reviews] Corrupted recurring reviews JSON backed up safely.')
      return {}
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      window.localStorage.setItem(RECURRING_REVIEWS_CORRUPT_BACKUP_KEY, raw)
      return {}
    }

    const validReviews: Record<string, RecurringReviewRecord> = {}
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        val &&
        typeof val === 'object' &&
        'status' in val &&
        ((val as { status: unknown }).status === 'confirmed' || (val as { status: unknown }).status === 'dismissed')
      ) {
        const item = val as { candidateKey?: string; status: 'confirmed' | 'dismissed'; reviewedAt?: string; userNotes?: string }
        validReviews[key] = {
          candidateKey: typeof item.candidateKey === 'string' ? item.candidateKey : key,
          status: item.status,
          reviewedAt: typeof item.reviewedAt === 'string' ? item.reviewedAt : new Date().toISOString(),
          userNotes: typeof item.userNotes === 'string' ? item.userNotes : undefined,
        }
      }
    }

    return validReviews
  } catch (err) {
    console.warn('[Finora Reviews] Unable to access localStorage for recurring reviews:', err)
    return {}
  }
}

/**
 * Persists a review decision into localStorage.
 */
export function saveRecurringReview(record: RecurringReviewRecord): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false

    const existing = loadRecurringReviews()
    existing[record.candidateKey] = record
    window.localStorage.setItem(RECURRING_REVIEWS_STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch (err) {
    console.warn('[Finora Reviews] Failed to save review decision:', err)
    return false
  }
}

/**
 * Removes a review decision (reinstating candidate to default suggested state).
 */
export function removeRecurringReview(candidateKey: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false

    const existing = loadRecurringReviews()
    if (!existing[candidateKey]) return false

    delete existing[candidateKey]
    window.localStorage.setItem(RECURRING_REVIEWS_STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch (err) {
    console.warn('[Finora Reviews] Failed to remove review decision:', err)
    return false
  }
}

/**
 * Clears all recurring review decisions from storage.
 */
export function clearRecurringReviews(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(RECURRING_REVIEWS_STORAGE_KEY)
    }
  } catch (err) {
    console.warn('[Finora Reviews] Failed to clear recurring reviews:', err)
  }
}
