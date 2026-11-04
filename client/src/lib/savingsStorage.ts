export const SAVINGS_REVIEWS_STORAGE_KEY = 'finora.savingsReviews.v1'
export const LEGACY_SAVINGS_PLANS_KEY = 'finora_savings_plans_v1'
export const SAVINGS_REVIEWS_CORRUPT_BACKUP_KEY = 'finora.savingsReviews.v1.corrupt_backup'

export interface SavingsReviewRecord {
  opportunityKey: string
  status: 'saved' | 'planned' | 'completed' | 'dismissed'
  reviewedAt: string
  userNotes?: string
  customTargetPercent?: number
}

/**
 * Creates a stable deterministic key for a savings opportunity based on type and source.
 * e.g., "sav-rec-spotify", "sav-cat-food-dining", "sav-anom-tx-123"
 */
export function getDeterministicOpportunityKey(type: string, sourceIdentifier: string): string {
  const cleanSource = sourceIdentifier
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
  return `sav-${type}-${cleanSource}`
}

/**
 * Safely loads user review decisions for savings opportunities from localStorage.
 * Handles corrupt JSON safely without throwing.
 */
export function loadSavingsReviews(): Record<string, SavingsReviewRecord> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {}
    }

    let raw = window.localStorage.getItem(SAVINGS_REVIEWS_STORAGE_KEY)
    if (!raw) {
      // Check legacy savings plans key for safe idempotent backward compatibility
      raw = window.localStorage.getItem(LEGACY_SAVINGS_PLANS_KEY)
      if (!raw) return {}
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Backup corrupted string and return safe fallback
      window.localStorage.setItem(SAVINGS_REVIEWS_CORRUPT_BACKUP_KEY, raw)
      return {}
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const validReviews: Record<string, SavingsReviewRecord> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        value &&
        typeof value === 'object' &&
        'status' in value &&
        typeof (value as { status: unknown }).status === 'string' &&
        ['saved', 'planned', 'completed', 'dismissed'].includes(
          (value as { status: string }).status
        )
      ) {
        const item = value as Partial<SavingsReviewRecord>
        validReviews[key] = {
          opportunityKey: key,
          status: item.status as 'saved' | 'planned' | 'completed' | 'dismissed',
          reviewedAt: typeof item.reviewedAt === 'string' ? item.reviewedAt : new Date().toISOString(),
          userNotes: typeof item.userNotes === 'string' ? item.userNotes : undefined,
          customTargetPercent:
            typeof item.customTargetPercent === 'number' ? item.customTargetPercent : undefined,
        }
      }
    }

    return validReviews
  } catch {
    return {}
  }
}

/**
 * Persists a savings opportunity review decision into localStorage.
 */
export function saveSavingsReview(record: SavingsReviewRecord): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    const current = loadSavingsReviews()
    current[record.opportunityKey] = record
    window.localStorage.setItem(SAVINGS_REVIEWS_STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Fail gracefully on storage quota errors
  }
}

/**
 * Removes a savings opportunity review decision from localStorage.
 */
export function removeSavingsReview(opportunityKey: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    const current = loadSavingsReviews()
    delete current[opportunityKey]
    window.localStorage.setItem(SAVINGS_REVIEWS_STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Fail gracefully
  }
}

/**
 * Clears all savings opportunity reviews from localStorage.
 */
export function clearSavingsReviews(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.removeItem(SAVINGS_REVIEWS_STORAGE_KEY)
  } catch {
    // Fail gracefully
  }
}
