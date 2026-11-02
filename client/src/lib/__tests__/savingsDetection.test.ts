import { describe, it, expect, beforeEach } from 'vitest'
import {
  detectSavingsOpportunities,
} from '../savingsDetection'
import {
  loadSavingsReviews,
  saveSavingsReview,
  removeSavingsReview,
  clearSavingsReviews,
  getDeterministicOpportunityKey,
  type SavingsReviewRecord,
  SAVINGS_REVIEWS_STORAGE_KEY,
} from '../savingsStorage'
import type { Transaction, RecurringCandidate, AnomalyFinding } from '../../types/finance'

describe('savingsDetection & savingsStorage', () => {
  let mockStore: Record<string, string> = {}

  beforeEach(() => {
    mockStore = {}
    const mockLocalStorage: Storage = {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStore[key] = String(val)
      },
      removeItem: (key: string) => {
        delete mockStore[key]
      },
      clear: () => {
        mockStore = {}
      },
      length: 0,
      key: () => null,
    }

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: mockLocalStorage },
      writable: true,
      configurable: true,
    })
  })

  describe('Empty and Edge-Case Input Handling', () => {
    it('produces zero opportunities and zero savings for empty transactions', () => {
      const res = detectSavingsOpportunities([])
      expect(res.allOpportunities).toEqual([])
      expect(res.summary.activeCount).toBe(0)
      expect(res.summary.totalPotentialMonthly).toBe(0)
      expect(res.summary.totalPotentialAnnual).toBe(0)
      expect(res.summary.plannedMonthlySavings).toBe(0)
    })

    it('safely handles non-array or malformed input without throwing', () => {
      // @ts-expect-error Testing runtime invalid input
      const res = detectSavingsOpportunities(null)
      expect(res.allOpportunities).toEqual([])
      expect(res.summary.activeCount).toBe(0)
    })

    it('ignores income transactions and zero/negative amount records', () => {
      const nonExpenseTxs: Transaction[] = [
        {
          id: 'inc-1',
          date: '2026-04-01',
          description: 'Internship Stipend',
          amount: 45000,
          category: 'Income',
          type: 'income',
        },
        {
          id: 'inc-2',
          date: '2026-04-15',
          description: 'Freelance Design',
          amount: 15000,
          category: 'Income',
          type: 'income',
        },
        {
          id: 'zero-1',
          date: '2026-04-10',
          description: 'Zero Auth Charge',
          amount: 0,
          category: 'Digital Services',
          type: 'expense',
        },
      ]

      const res = detectSavingsOpportunities(nonExpenseTxs, {}, { referenceDateStr: '2026-04-20' })
      expect(res.allOpportunities).toEqual([])
      expect(res.summary.totalPotentialMonthly).toBe(0)
    })

    it('suppresses category trim recommendations when spending is sparse (< 3 transactions)', () => {
      const sparseTxs: Transaction[] = [
        {
          id: 'sp-1',
          date: '2026-04-05',
          description: 'High-end Dinner',
          amount: 2500,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'sp-2',
          date: '2026-04-12',
          description: 'Brunch',
          amount: 1500,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      // Only 2 transactions in Food & Dining -> below 3-transaction threshold
      const res = detectSavingsOpportunities(sparseTxs, {}, { referenceDateStr: '2026-04-15' })
      const catTrim = res.allOpportunities.find((o) => o.type === 'discretionary_trim')
      expect(catTrim).toBeUndefined()
    })
  })

  describe('Discretionary Category Trimming (Rule 1)', () => {
    const diningTxs: Transaction[] = [
      { id: 'd-1', date: '2026-04-02', description: 'Cafe Latte', amount: 300, category: 'Food & Dining', type: 'expense' },
      { id: 'd-2', date: '2026-04-06', description: 'Burgers', amount: 800, category: 'Food & Dining', type: 'expense' },
      { id: 'd-3', date: '2026-04-10', description: 'Sushi Dinner', amount: 2400, category: 'Food & Dining', type: 'expense' },
      { id: 'd-4', date: '2026-04-14', description: 'Pizza Night', amount: 1500, category: 'Food & Dining', type: 'expense' },
      { id: 'd-5', date: '2026-04-18', description: 'Breakfast Club', amount: 1200, category: 'Food & Dining', type: 'expense' },
      { id: 'd-6', date: '2026-04-22', description: 'Coffee & Dessert', amount: 800, category: 'Food & Dining', type: 'expense' },
    ] // Total 30-day spend = 300 + 800 + 2400 + 1500 + 1200 + 800 = 7000 (>= 6000 -> 10% target)

    it('generates honest 10% reduction target on high discretionary spending (>= ₹6,000)', () => {
      const res = detectSavingsOpportunities(diningTxs, {}, { referenceDateStr: '2026-04-25' })
      const diningOpp = res.allOpportunities.find((o) => o.category === 'Food & Dining' && o.type === 'discretionary_trim')

      expect(diningOpp).toBeDefined()
      expect(diningOpp?.title).toBe('10% Target for Food & Dining')
      expect(diningOpp?.currentMonthlySpend).toBe(7000)
      expect(diningOpp?.potentialMonthlySavings).toBe(700) // 10% of 7000
      expect(diningOpp?.potentialAnnualSavings).toBe(8400) // 700 * 12
      expect(diningOpp?.evidenceQuality).toBe('high') // 6 transactions
      expect(diningOpp?.opportunityKey).toBe(getDeterministicOpportunityKey('cat', 'Food & Dining'))
    })

    it('generates honest 15% reduction target on moderate discretionary spending (₹1,200 - ₹5,999)', () => {
      const shoppingTxs: Transaction[] = [
        { id: 's-1', date: '2026-04-03', description: 'T-Shirt', amount: 1000, category: 'Shopping', type: 'expense' },
        { id: 's-2', date: '2026-04-10', description: 'Bookstore', amount: 800, category: 'Shopping', type: 'expense' },
        { id: 's-3', date: '2026-04-18', description: 'Stationery', amount: 600, category: 'Shopping', type: 'expense' },
      ] // Total = 2400 (< 6000 -> 15% target = 360)

      const res = detectSavingsOpportunities(shoppingTxs, {}, { referenceDateStr: '2026-04-20' })
      const shopOpp = res.allOpportunities.find((o) => o.category === 'Shopping' && o.type === 'discretionary_trim')

      expect(shopOpp).toBeDefined()
      expect(shopOpp?.title).toBe('15% Target for Shopping')
      expect(shopOpp?.currentMonthlySpend).toBe(2400)
      expect(shopOpp?.potentialMonthlySavings).toBe(360)
      expect(shopOpp?.evidenceQuality).toBe('moderate') // 3 transactions
    })
  })

  describe('Recurring Payment Subscriptions (Rule 2)', () => {
    it('creates review opportunity for discretionary subscriptions and excludes non-discretionary rent', () => {
      const recurringCandidates: RecurringCandidate[] = [
        {
          id: 'rec-cand-netflix',
          candidateKey: 'rec-netflix',
          merchant: 'Netflix Entertainment',
          category: 'Digital Services',
          amount: 649,
          cadence: 'Monthly',
          confidence: 0.95,
          lastBilled: '2026-04-05',
          nextExpected: '2026-05-05',
          status: 'Candidate',
          occurrenceCount: 4,
          matchingTransactionIds: ['tx-1', 'tx-2', 'tx-3', 'tx-4'],
          averageAmount: 649,
          monthlyEquivalent: 649,
          annualEquivalent: 649 * 12,
          amountVariability: 'exact',
          cadenceConsistency: 'regular',
          explanation: '4 recurring payments',
          reviewStatus: 'suggested',
        },
        {
          id: 'rec-cand-hostel-rent',
          candidateKey: 'rec-hostel-rent',
          merchant: 'Student Hostel Rent',
          category: 'Housing',
          amount: 15000,
          cadence: 'Monthly',
          confidence: 0.98,
          lastBilled: '2026-04-01',
          nextExpected: '2026-05-01',
          status: 'Confirmed',
          occurrenceCount: 4,
          matchingTransactionIds: ['rent-1', 'rent-2'],
          averageAmount: 15000,
          monthlyEquivalent: 15000,
          annualEquivalent: 180000,
          amountVariability: 'exact',
          cadenceConsistency: 'regular',
          explanation: 'Monthly rent',
          reviewStatus: 'confirmed',
        },
      ]

      const dummyTxs: Transaction[] = [
        { id: 'tx-1', date: '2026-04-01', description: 'Netflix', amount: 649, category: 'Digital Services', type: 'expense' },
        { id: 'tx-2', date: '2026-04-01', description: 'Hostel Rent', amount: 15000, category: 'Housing', type: 'expense' },
      ]

      const res = detectSavingsOpportunities(dummyTxs, {}, {
        recurringCandidates,
        referenceDateStr: '2026-04-10',
      })

      // Netflix should generate an opportunity
      const netflixOpp = res.allOpportunities.find((o) => o.sourceId === 'rec-netflix')
      expect(netflixOpp).toBeDefined()
      expect(netflixOpp?.title).toBe('Review Netflix Entertainment Subscription')
      expect(netflixOpp?.potentialMonthlySavings).toBe(649)
      expect(netflixOpp?.evidenceQuality).toBe('high')

      // Rent should NOT generate an opportunity to cancel housing
      const rentOpp = res.allOpportunities.find((o) => o.sourceId === 'rec-hostel-rent')
      expect(rentOpp).toBeUndefined()
    })
  })

  describe('Merchant Concentration & Double-Counting Prevention (Rule 3)', () => {
    it('detects high-frequency convenience delivery merchant and avoids double-counting against category trim', () => {
      // 5 Swiggy orders totaling ₹2500 in Food & Dining
      const swiggyTxs: Transaction[] = [
        { id: 'sw-1', date: '2026-04-02', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-2', date: '2026-04-07', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-3', date: '2026-04-12', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-4', date: '2026-04-17', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-5', date: '2026-04-22', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
      ]

      const res = detectSavingsOpportunities(swiggyTxs, {}, {
        recurringCandidates: [],
        referenceDateStr: '2026-04-25',
      })

      // Should have a category trim for Food & Dining (2500 spend >= 1200 -> 15% = 375)
      const catTrim = res.allOpportunities.find((o) => o.type === 'discretionary_trim')
      expect(catTrim).toBeDefined()
      expect(catTrim?.potentialMonthlySavings).toBe(375)

      // Should also have a merchant concentration for Swiggy
      const merchOpp = res.allOpportunities.find((o) => o.type === 'merchant_concentration')
      expect(merchOpp).toBeDefined()
      expect(merchOpp?.title).toBe('Batch Swiggy Food Orders')

      // Double counting verification:
      // totalPotentialMonthly must NOT sum both category trim AND merchant concentration redundantly
      expect(res.summary.totalPotentialMonthly).toBe(375)
    })
  })

  describe('Anomaly Follow-up Actions (Rule 4)', () => {
    it('generates an actionable audit opportunity for high-severity anomalies with zero false monthly recurring inflation', () => {
      const anomalyFindings: AnomalyFinding[] = [
        {
          id: 'anom-1',
          findingKey: 'anom-tx-999-outlier',
          transactionId: 'tx-999',
          merchant: 'Luxury Gadget Store',
          category: 'Shopping',
          amount: 8500,
          baselineAmount: 1200,
          ratio: 7.1,
          severity: 'high',
          reason: 'Unusual spike',
          date: '2026-04-18',
          absoluteDeviation: 7300,
          evidenceQuality: 'high',
          sampleCount: 5,
          baselineMethod: 'merchant',
          comparableTransactionIds: [],
          reviewStatus: 'active',
        },
      ]

      const dummyTxs: Transaction[] = [
        { id: 'tx-999', date: '2026-04-18', description: 'Luxury Gadget Store', amount: 8500, category: 'Shopping', type: 'expense' },
      ]

      const res = detectSavingsOpportunities(dummyTxs, {}, {
        anomalyFindings,
        referenceDateStr: '2026-04-20',
      })

      const anomOpp = res.allOpportunities.find((o) => o.type === 'anomaly_remediation')
      expect(anomOpp).toBeDefined()
      expect(anomOpp?.title).toBe('Audit Outlier at Luxury Gadget Store')
      // Honest representation: One-time anomalies do NOT falsely inflate ongoing monthly potential savings
      expect(anomOpp?.potentialMonthlySavings).toBe(0)
      expect(anomOpp?.timeBasis).toBe('annual')
      expect(anomOpp?.potentialAnnualSavings).toBe(7300)
    })
  })

  describe('Review State Transitions & Persistence (Rule 5)', () => {
    const fixtureTxs: Transaction[] = [
      { id: 't-1', date: '2026-04-01', description: 'Cafe Coffee', amount: 500, category: 'Food & Dining', type: 'expense' },
      { id: 't-2', date: '2026-04-08', description: 'Cafe Coffee', amount: 500, category: 'Food & Dining', type: 'expense' },
      { id: 't-3', date: '2026-04-15', description: 'Cafe Coffee', amount: 500, category: 'Food & Dining', type: 'expense' },
      { id: 't-4', date: '2026-04-22', description: 'Cafe Coffee', amount: 500, category: 'Food & Dining', type: 'expense' },
    ]

    it('correctly transitions opportunities to saved, planned, completed, and dismissed', () => {
      const initial = detectSavingsOpportunities(fixtureTxs, {}, { referenceDateStr: '2026-04-25' })
      expect(initial.allOpportunities.length).toBeGreaterThan(0)
      const targetOpp = initial.allOpportunities[0]
      const key = targetOpp.opportunityKey

      // 1. Plan Opportunity
      const reviewsPlanned: Record<string, SavingsReviewRecord> = {
        [key]: {
          opportunityKey: key,
          status: 'planned',
          reviewedAt: new Date().toISOString(),
        },
      }
      const resPlanned = detectSavingsOpportunities(fixtureTxs, reviewsPlanned, { referenceDateStr: '2026-04-25' })
      expect(resPlanned.plannedOpportunities.map((o) => o.opportunityKey)).toContain(key)
      expect(resPlanned.summary.plannedCount).toBe(1)
      expect(resPlanned.summary.plannedMonthlySavings).toBeGreaterThan(0)

      // 2. Complete Opportunity
      const reviewsCompleted: Record<string, SavingsReviewRecord> = {
        [key]: {
          opportunityKey: key,
          status: 'completed',
          reviewedAt: new Date().toISOString(),
        },
      }
      const resCompleted = detectSavingsOpportunities(fixtureTxs, reviewsCompleted, { referenceDateStr: '2026-04-25' })
      expect(resCompleted.completedOpportunities.map((o) => o.opportunityKey)).toContain(key)
      expect(resCompleted.summary.completedCount).toBe(1)

      // 3. Dismiss Opportunity
      const reviewsDismissed: Record<string, SavingsReviewRecord> = {
        [key]: {
          opportunityKey: key,
          status: 'dismissed',
          reviewedAt: new Date().toISOString(),
        },
      }
      const resDismissed = detectSavingsOpportunities(fixtureTxs, reviewsDismissed, { referenceDateStr: '2026-04-25' })
      expect(resDismissed.dismissedOpportunities.map((o) => o.opportunityKey)).toContain(key)
      expect(resDismissed.activeOpportunities.map((o) => o.opportunityKey)).not.toContain(key)
    })

    it('preserves deterministic keys across reordered inputs', () => {
      const res1 = detectSavingsOpportunities(fixtureTxs, {}, { referenceDateStr: '2026-04-25' })
      const reversedTxs = [...fixtureTxs].reverse()
      const res2 = detectSavingsOpportunities(reversedTxs, {}, { referenceDateStr: '2026-04-25' })

      const keys1 = res1.allOpportunities.map((o) => o.opportunityKey).sort()
      const keys2 = res2.allOpportunities.map((o) => o.opportunityKey).sort()
      expect(keys1).toEqual(keys2)
    })
  })

  describe('savingsStorage Engine Resilience', () => {
    it('loads, saves, removes, and clears review records in localStorage', () => {
      expect(loadSavingsReviews()).toEqual({})

      const record: SavingsReviewRecord = {
        opportunityKey: 'sav-cat-food-dining',
        status: 'planned',
        reviewedAt: '2026-04-20T10:00:00.000Z',
        customTargetPercent: 12,
      }

      saveSavingsReview(record)
      const loaded = loadSavingsReviews()
      expect(loaded['sav-cat-food-dining']).toEqual(record)

      removeSavingsReview('sav-cat-food-dining')
      expect(loadSavingsReviews()).toEqual({})

      saveSavingsReview(record)
      clearSavingsReviews()
      expect(loadSavingsReviews()).toEqual({})
    })

    it('recovers safely from corrupted localStorage JSON without throwing', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SAVINGS_REVIEWS_STORAGE_KEY, '{ broken-json :::')
        const loaded = loadSavingsReviews()
        expect(loaded).toEqual({})
      }
    })
  })
})
