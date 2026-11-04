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

describe('savingsDetection & savingsStorage — Financial Integrity Suite', () => {
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

  describe('1. Input Guardrails & Currency Invariants', () => {
    it('produces zero opportunities and zero savings for empty transactions', () => {
      const res = detectSavingsOpportunities([])
      expect(res.allOpportunities).toEqual([])
      expect(res.summary.activeCount).toBe(0)
      expect(res.summary.totalPotentialMonthly).toBe(0)
      expect(res.summary.totalPotentialAnnual).toBe(0)
      expect(res.summary.plannedMonthlySavings).toBe(0)
    })

    it('safely handles non-array or null input without throwing', () => {
      // @ts-expect-error Testing runtime invalid input
      const res = detectSavingsOpportunities(null)
      expect(res.allOpportunities).toEqual([])
      expect(res.summary.activeCount).toBe(0)
    })

    it('strictly excludes income, non-numeric, non-finite, zero, and negative INR amounts', () => {
      const invalidTxs: Transaction[] = [
        {
          id: 'inc-1',
          date: '2026-04-01',
          description: 'Internship Stipend',
          amount: 45000,
          category: 'Income',
          type: 'income',
        },
        {
          id: 'zero-1',
          date: '2026-04-05',
          description: 'Zero Auth',
          amount: 0,
          category: 'Digital Services',
          type: 'expense',
        },
        {
          id: 'neg-1',
          date: '2026-04-08',
          description: 'Refund Reversal',
          amount: -500,
          category: 'Shopping',
          type: 'expense',
        },
        {
          id: 'nan-1',
          date: '2026-04-10',
          description: 'Corrupted Amount',
          amount: NaN,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'inf-1',
          date: '2026-04-12',
          description: 'Infinite Amount',
          amount: Infinity,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'bad-date-1',
          date: '04/20/2026', // Not ISO YYYY-MM-DD
          description: 'Wrong Date Format',
          amount: 1000,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      const res = detectSavingsOpportunities(invalidTxs, {}, { referenceDateStr: '2026-04-20' })
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

      const res = detectSavingsOpportunities(sparseTxs, {}, { referenceDateStr: '2026-04-15' })
      const catTrim = res.allOpportunities.find((o) => o.type === 'discretionary_trim')
      expect(catTrim).toBeUndefined()
    })
  })

  describe('2. Discretionary Category Trimming (Uniform 10% Target)', () => {
    it('applies a consistent, defensible 10% reduction target on qualifying spend (>= ₹1,500)', () => {
      const diningTxs: Transaction[] = [
        { id: 'd-1', date: '2026-04-02', description: 'Cafe Latte', amount: 300, category: 'Food & Dining', type: 'expense' },
        { id: 'd-2', date: '2026-04-06', description: 'Burgers', amount: 800, category: 'Food & Dining', type: 'expense' },
        { id: 'd-3', date: '2026-04-10', description: 'Sushi Dinner', amount: 2400, category: 'Food & Dining', type: 'expense' },
        { id: 'd-4', date: '2026-04-14', description: 'Pizza Night', amount: 1500, category: 'Food & Dining', type: 'expense' },
        { id: 'd-5', date: '2026-04-18', description: 'Breakfast Club', amount: 1200, category: 'Food & Dining', type: 'expense' },
        { id: 'd-6', date: '2026-04-22', description: 'Coffee & Dessert', amount: 800, category: 'Food & Dining', type: 'expense' },
      ] // Total 30-day spend = 7000

      const res = detectSavingsOpportunities(diningTxs, {}, { referenceDateStr: '2026-04-25' })
      const diningOpp = res.allOpportunities.find((o) => o.category === 'Food & Dining' && o.type === 'discretionary_trim')

      expect(diningOpp).toBeDefined()
      expect(diningOpp?.title).toBe('10% Target for Food & Dining')
      expect(diningOpp?.currentMonthlySpend).toBe(7000)
      expect(diningOpp?.potentialMonthlySavings).toBe(700) // Exactly 10% of 7000
      expect(diningOpp?.potentialAnnualSavings).toBe(8400) // 700 * 12
      expect(diningOpp?.evidenceQuality).toBe('high') // 6 transactions
      expect(diningOpp?.opportunityKey).toBe(getDeterministicOpportunityKey('cat', 'Food & Dining'))
    })

    it('enforces boundary threshold: suppresses category trim when 30-day spend is ₹1,499 and qualifies at ₹1,500', () => {
      const belowThresholdTxs: Transaction[] = [
        { id: 'b-1', date: '2026-04-01', description: 'Item 1', amount: 500, category: 'Shopping', type: 'expense' },
        { id: 'b-2', date: '2026-04-10', description: 'Item 2', amount: 500, category: 'Shopping', type: 'expense' },
        { id: 'b-3', date: '2026-04-18', description: 'Item 3', amount: 499, category: 'Shopping', type: 'expense' },
      ] // Total = 1499 (< 1500 threshold)

      const resBelow = detectSavingsOpportunities(belowThresholdTxs, {}, { referenceDateStr: '2026-04-20' })
      expect(resBelow.allOpportunities.find((o) => o.type === 'discretionary_trim')).toBeUndefined()

      const atThresholdTxs: Transaction[] = [
        { id: 'a-1', date: '2026-04-01', description: 'Item 1', amount: 500, category: 'Shopping', type: 'expense' },
        { id: 'a-2', date: '2026-04-10', description: 'Item 2', amount: 500, category: 'Shopping', type: 'expense' },
        { id: 'a-3', date: '2026-04-18', description: 'Item 3', amount: 500, category: 'Shopping', type: 'expense' },
      ] // Total = 1500 (>= 1500 threshold)

      const resAt = detectSavingsOpportunities(atThresholdTxs, {}, { referenceDateStr: '2026-04-20' })
      const oppAt = resAt.allOpportunities.find((o) => o.type === 'discretionary_trim')
      expect(oppAt).toBeDefined()
      expect(oppAt?.potentialMonthlySavings).toBe(150) // 10% of 1500
    })
  })

  describe('3. Recurring Subscriptions — Observed Outflow vs. Savings Integrity', () => {
    it('distinguishes observed recurring commitment from hypothetical savings and excludes full cost from baseline savings', () => {
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

      // Netflix recommendation exists as an audit review
      const netflixOpp = res.allOpportunities.find((o) => o.sourceId === 'rec-netflix')
      expect(netflixOpp).toBeDefined()
      expect(netflixOpp?.title).toBe('Review Netflix Entertainment Subscription')
      expect(netflixOpp?.currentMonthlySpend).toBe(649) // Accurately displays the observed outflow
      // Baseline potential savings is strictly 0 to prevent claiming uncancelled subscriptions as savings
      expect(netflixOpp?.potentialMonthlySavings).toBe(0)

      // Total evidence-backed potential monthly savings must NOT include the ₹649
      expect(res.summary.totalPotentialMonthly).toBe(0)

      // Essential rent must NEVER be recommended for cancellation
      const rentOpp = res.allOpportunities.find((o) => o.sourceId === 'rec-hostel-rent')
      expect(rentOpp).toBeUndefined()
    })
  })

  describe('4. Convenience Merchant Concentration — Fee Avoidance Audit', () => {
    it('produces a behavioral frequency insight with ₹0 claimed fee avoidance when fees are not broken out in data', () => {
      const swiggyTxs: Transaction[] = [
        { id: 'sw-1', date: '2026-04-02', description: 'Swiggy Food', amount: 450, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-2', date: '2026-04-07', description: 'Swiggy Food', amount: 520, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-3', date: '2026-04-12', description: 'Swiggy Food', amount: 380, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-4', date: '2026-04-17', description: 'Swiggy Food', amount: 490, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-5', date: '2026-04-22', description: 'Swiggy Food', amount: 510, category: 'Food & Dining', type: 'expense' },
      ] // 5 orders, total spend = 2350

      const res = detectSavingsOpportunities(swiggyTxs, {}, {
        recurringCandidates: [],
        referenceDateStr: '2026-04-25',
      })

      const merchOpp = res.allOpportunities.find((o) => o.type === 'merchant_concentration')
      expect(merchOpp).toBeDefined()
      expect(merchOpp?.title).toBe('Batch Swiggy Food Orders')
      expect(merchOpp?.currentMonthlySpend).toBe(2350)
      expect(merchOpp?.sourceRecordCount).toBe(5)
      // Honest Accounting: Does not fabricate ₹40 per order fee avoidance
      expect(merchOpp?.potentialMonthlySavings).toBe(0)
      expect(merchOpp?.potentialAnnualSavings).toBe(0)
    })
  })

  describe('5. Double-Counting Prevention in Multi-Source Overlapping Datasets', () => {
    it('guarantees that overlapping merchant, recurring, anomaly, and category items do NOT double-count in aggregate totals', () => {
      // Overlapping dataset:
      // 1. Food & Dining: 4 Swiggy orders (₹2,000) + 2 Cafe orders (₹1,000) = ₹3,000 total spend
      // 2. Digital Services: 1 Netflix recurring candidate (₹649/mo)
      // 3. Shopping: 3 purchases totaling ₹3,000
      // 4. Shopping Anomaly: Outlier of ₹8,500 in Shopping
      const overlappingTxs: Transaction[] = [
        { id: 'sw-1', date: '2026-04-02', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-2', date: '2026-04-08', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-3', date: '2026-04-14', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'sw-4', date: '2026-04-20', description: 'Swiggy Food', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'cf-1', date: '2026-04-10', description: 'Cafe Bistro', amount: 500, category: 'Food & Dining', type: 'expense' },
        { id: 'cf-2', date: '2026-04-22', description: 'Cafe Bistro', amount: 500, category: 'Food & Dining', type: 'expense' },
        // Shopping
        { id: 'sh-1', date: '2026-04-05', description: 'Books Store', amount: 1000, category: 'Shopping', type: 'expense' },
        { id: 'sh-2', date: '2026-04-12', description: 'Clothing Outlet', amount: 1000, category: 'Shopping', type: 'expense' },
        { id: 'sh-3', date: '2026-04-19', description: 'Shoes', amount: 1000, category: 'Shopping', type: 'expense' },
        // Outlier
        { id: 'anom-tx', date: '2026-04-15', description: 'Laptop Store', amount: 8500, category: 'Shopping', type: 'expense' },
      ]

      const recurringCandidates: RecurringCandidate[] = [
        {
          id: 'rec-cand-netflix',
          candidateKey: 'rec-netflix',
          merchant: 'Netflix',
          category: 'Digital Services',
          amount: 649,
          cadence: 'Monthly',
          confidence: 0.95,
          lastBilled: '2026-04-05',
          nextExpected: '2026-05-05',
          status: 'Candidate',
          occurrenceCount: 3,
          matchingTransactionIds: [],
          averageAmount: 649,
          monthlyEquivalent: 649,
          annualEquivalent: 649 * 12,
          amountVariability: 'exact',
          cadenceConsistency: 'regular',
          explanation: 'Netflix',
          reviewStatus: 'suggested',
        },
      ]

      const anomalyFindings: AnomalyFinding[] = [
        {
          id: 'anom-1',
          findingKey: 'anom-anom-tx',
          transactionId: 'anom-tx',
          merchant: 'Laptop Store',
          category: 'Shopping',
          amount: 8500,
          baselineAmount: 1000,
          ratio: 8.5,
          severity: 'high',
          reason: 'Outlier',
          date: '2026-04-15',
          absoluteDeviation: 7500,
          evidenceQuality: 'high',
          sampleCount: 3,
          baselineMethod: 'category',
          comparableTransactionIds: [],
          reviewStatus: 'active',
        },
      ]

      const res = detectSavingsOpportunities(overlappingTxs, {}, {
        recurringCandidates,
        anomalyFindings,
        referenceDateStr: '2026-04-25',
      })

      // Expected Defensible Amounts:
      // Food & Dining: Total spend = 3000 -> 10% target = ₹300
      // Shopping: Total spend = 3000 + 8500 = 11500 across 4 txs -> 10% target = ₹1150
      // Swiggy merchant concentration: ₹0
      // Netflix recurring review: ₹0
      // Laptop Store anomaly audit: ₹0
      //
      // Total Potential Monthly Savings MUST strictly equal Food & Dining (300) + Shopping (1150) = ₹1450.
      // It must NOT include Swiggy fee claims, Netflix cost (649), or the anomaly spike (7500)!
      expect(res.summary.totalPotentialMonthly).toBe(300 + 1150)
      expect(res.summary.totalPotentialAnnual).toBe((300 + 1150) * 12)
    })
  })

  describe('6. Review State Semantics — Planned vs. Completed vs. Realized', () => {
    const fixtureTxs: Transaction[] = [
      { id: 't-1', date: '2026-04-01', description: 'Cafe Coffee', amount: 600, category: 'Food & Dining', type: 'expense' },
      { id: 't-2', date: '2026-04-08', description: 'Cafe Coffee', amount: 600, category: 'Food & Dining', type: 'expense' },
      { id: 't-3', date: '2026-04-15', description: 'Cafe Coffee', amount: 600, category: 'Food & Dining', type: 'expense' },
      { id: 't-4', date: '2026-04-22', description: 'Cafe Coffee', amount: 600, category: 'Food & Dining', type: 'expense' },
    ] // Spend = 2400 -> 10% target = 240

    it('correctly updates user commitments when planned, and increments user-reported count without creating fake realized cash', () => {
      const initial = detectSavingsOpportunities(fixtureTxs, {}, { referenceDateStr: '2026-04-25' })
      const catOpp = initial.allOpportunities.find((o) => o.type === 'discretionary_trim')!
      const key = catOpp.opportunityKey

      // 1. Initial State
      expect(initial.summary.plannedMonthlySavings).toBe(0)
      expect(initial.summary.plannedCount).toBe(0)
      expect(initial.summary.completedCount).toBe(0)

      // 2. User Plans Opportunity
      const reviewsPlanned: Record<string, SavingsReviewRecord> = {
        [key]: {
          opportunityKey: key,
          status: 'planned',
          reviewedAt: new Date().toISOString(),
          customTargetPercent: 10,
        },
      }
      const resPlanned = detectSavingsOpportunities(fixtureTxs, reviewsPlanned, { referenceDateStr: '2026-04-25' })
      expect(resPlanned.summary.plannedCount).toBe(1)
      expect(resPlanned.summary.plannedMonthlySavings).toBe(240)
      expect(resPlanned.summary.completedCount).toBe(0)

      // 3. User Marks Opportunity Complete (User-reported personal action)
      const reviewsCompleted: Record<string, SavingsReviewRecord> = {
        [key]: {
          opportunityKey: key,
          status: 'completed',
          reviewedAt: new Date().toISOString(),
        },
      }
      const resCompleted = detectSavingsOpportunities(fixtureTxs, reviewsCompleted, { referenceDateStr: '2026-04-25' })
      expect(resCompleted.summary.completedCount).toBe(1)
      // Marking completed does NOT add to planned commitments or fabricate a bank balance verification
      expect(resCompleted.summary.plannedMonthlySavings).toBe(0)

      // 4. User Dismisses Opportunity
      const reviewsDismissed: Record<string, SavingsReviewRecord> = {
        [key]: {
          opportunityKey: key,
          status: 'dismissed',
          reviewedAt: new Date().toISOString(),
        },
      }
      const resDismissed = detectSavingsOpportunities(fixtureTxs, reviewsDismissed, { referenceDateStr: '2026-04-25' })
      expect(resDismissed.activeOpportunities.find((o) => o.opportunityKey === key)).toBeUndefined()
      expect(resDismissed.summary.totalPotentialMonthly).toBe(0)
    })
  })

  describe('7. Storage Engine Serialization & Corruption Recovery', () => {
    it('persists, updates, and removes review records in localStorage', () => {
      expect(loadSavingsReviews()).toEqual({})

      const record: SavingsReviewRecord = {
        opportunityKey: 'sav-cat-food-dining',
        status: 'planned',
        reviewedAt: '2026-04-20T10:00:00.000Z',
        customTargetPercent: 10,
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

    it('safely tolerates corrupted JSON in localStorage without throwing', () => {
      window.localStorage.setItem(SAVINGS_REVIEWS_STORAGE_KEY, '{ invalid json corrupted :::')
      const loaded = loadSavingsReviews()
      expect(loaded).toEqual({})
    })
  })
})
