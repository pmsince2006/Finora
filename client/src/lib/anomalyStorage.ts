export const ANOMALY_REVIEWS_STORAGE_KEY = 'finora.anomalyReviews.v1'
export const ANOMALY_REVIEWS_CORRUPT_BACKUP_KEY = 'finora.anomalyReviews.v1.corrupt_backup'

export interface AnomalyReviewRecord {
  findingKey: string
  transactionId: string
  status: 'reviewed' | 'dismissed'
  reviewedAt: string
  userNotes?: string
}

/**
 * Creates a deterministic key for an anomaly finding based on transaction ID and rule identifier.
 * e.g., "anom-tx-2026-04-18"
 */
export function getDeterministicFindingKey(transactionId: string, ruleId: string = 'outlier_v1'): string {
  return `anom-${transactionId}-${ruleId}`
}

/**
 * Safely loads user review decisions for anomalies from localStorage.
 * Handles corrupt JSON safely without throwing.
 */
export function loadAnomalyReviews(): Record<string, AnomalyReviewRecord> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {}
    }

    const raw = window.localStorage.getItem(ANOMALY_REVIEWS_STORAGE_KEY)
    if (!raw) return {}

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      window.localStorage.setItem(ANOMALY_REVIEWS_CORRUPT_BACKUP_KEY, raw)
      console.warn('[Finora Anomaly Reviews] Corrupted anomaly reviews JSON backed up safely.')
      return {}
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      window.localStorage.setItem(ANOMALY_REVIEWS_CORRUPT_BACKUP_KEY, raw)
      return {}
    }

    const validReviews: Record<string, AnomalyReviewRecord> = {}
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        val &&
        typeof val === 'object' &&
        'status' in val &&
        ((val as { status: unknown }).status === 'reviewed' || (val as { status: unknown }).status === 'dismissed')
      ) {
        const item = val as {
          findingKey?: string
          transactionId?: string
          status: 'reviewed' | 'dismissed'
          reviewedAt?: string
          userNotes?: string
        }
        validReviews[key] = {
          findingKey: typeof item.findingKey === 'string' ? item.findingKey : key,
          transactionId: typeof item.transactionId === 'string' ? item.transactionId : key.replace(/^anom-/, ''),
          status: item.status,
          reviewedAt: typeof item.reviewedAt === 'string' ? item.reviewedAt : new Date().toISOString(),
          userNotes: typeof item.userNotes === 'string' ? item.userNotes : undefined,
        }
      }
    }

    return validReviews
  } catch (err) {
    console.warn('[Finora Anomaly Reviews] Unable to access localStorage for anomaly reviews:', err)
    return {}
  }
}

/**
 * Persists an anomaly review decision into localStorage.
 */
export function saveAnomalyReview(record: AnomalyReviewRecord): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false

    const existing = loadAnomalyReviews()
    existing[record.findingKey] = record
    window.localStorage.setItem(ANOMALY_REVIEWS_STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch (err) {
    console.warn('[Finora Anomaly Reviews] Failed to save anomaly review decision:', err)
    return false
  }
}

/**
 * Removes an anomaly review decision (reinstating finding to default active state).
 */
export function removeAnomalyReview(findingKey: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false

    const existing = loadAnomalyReviews()
    if (!existing[findingKey]) return false

    delete existing[findingKey]
    window.localStorage.setItem(ANOMALY_REVIEWS_STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch (err) {
    console.warn('[Finora Anomaly Reviews] Failed to remove anomaly review decision:', err)
    return false
  }
}

/**
 * Clears all anomaly review decisions from storage.
 */
export function clearAnomalyReviews(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ANOMALY_REVIEWS_STORAGE_KEY)
    }
  } catch (err) {
    console.warn('[Finora Anomaly Reviews] Failed to clear anomaly reviews:', err)
  }
}
