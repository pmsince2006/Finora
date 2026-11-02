import { describe, it, expect } from 'vitest'
import {
  calculateMean,
  calculateMedian,
  calculateStdDev,
  calculateMad,
  detectSpendingAnomalies,
  compareCategoryPeriodSpending,
} from '../anomalyDetection'
import { getDeterministicFindingKey, type AnomalyReviewRecord } from '../anomalyStorage'
import type { Transaction } from '../../types/finance'

describe('anomalyDetection', () => {
  describe('statistical primitives', () => {
    it('calculates mean accurately', () => {
      expect(calculateMean([])).toBe(0)
      expect(calculateMean([10, 20, 30])).toBe(20)
      expect(calculateMean([5, 5, 5, 5])).toBe(5)
    })

    it('calculates median for odd and even length samples', () => {
      expect(calculateMedian([])).toBe(0)
      expect(calculateMedian([50])).toBe(50)
      expect(calculateMedian([10, 20, 30])).toBe(20)
      expect(calculateMedian([10, 20, 30, 40])).toBe(25)
      expect(calculateMedian([40, 10, 30, 20])).toBe(25)
    })

    it('calculates sample standard deviation with Bessel correction', () => {
      expect(calculateStdDev([])).toBe(0)
      expect(calculateStdDev([100])).toBe(0)
      expect(calculateStdDev([10, 10, 10])).toBe(0)

      const sd = calculateStdDev([10, 20])
      expect(Math.round(sd * 100) / 100).toBe(7.07)
    })

    it('calculates MAD and robust sigma (1.4826 * MAD)', () => {
      expect(calculateMad([])).toEqual({ mad: 0, robustSigma: 0 })

      const res = calculateMad([10, 12, 13, 14, 100])
      expect(res.mad).toBe(1)
      expect(Math.round(res.robustSigma * 1000) / 1000).toBe(1.483)
    })
  })

  describe('detectSpendingAnomalies (engine logic)', () => {
    it('handles empty or malformed inputs without throwing', () => {
      // @ts-expect-error Testing runtime invalid input
      const res1 = detectSpendingAnomalies(null)
      expect(res1.allFindings).toEqual([])
      expect(res1.summary.totalDetected).toBe(0)

      const res2 = detectSpendingAnomalies([])
      expect(res2.allFindings).toEqual([])
      expect(res2.summary.reviewableCount).toBe(0)
    })

    it('ignores transactions with amounts at or below historical baseline', () => {
      const txs: Transaction[] = [
        {
          id: 'b-1',
          date: '2026-03-01',
          description: 'Cafeteria Lunch',
          amount: 300,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'b-2',
          date: '2026-03-10',
          description: 'Cafeteria Lunch',
          amount: 320,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'b-3',
          date: '2026-03-20',
          description: 'Cafeteria Lunch',
          amount: 310,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'b-4',
          date: '2026-04-01',
          description: 'Cafeteria Lunch',
          amount: 250,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      const res = detectSpendingAnomalies(txs, {}, { referenceDateStr: '2026-04-05' })
      expect(res.allFindings.length).toBe(0)
    })

    it('strictly isolates historical baseline and excludes candidate from its own baseline', () => {
      const txs: Transaction[] = [
        {
          id: 't-1',
          date: '2026-03-01',
          description: 'Local Diner',
          amount: 400,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 't-2',
          date: '2026-03-15',
          description: 'Local Diner',
          amount: 420,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 't-3',
          date: '2026-03-28',
          description: 'Local Diner',
          amount: 380,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 't-spike',
          date: '2026-04-10',
          description: 'Fine Dining Extravaganza',
          amount: 3500,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      const res = detectSpendingAnomalies(txs, {}, { referenceDateStr: '2026-04-12' })
      expect(res.allFindings.length).toBe(1)

      const finding = res.allFindings[0]
      expect(finding.transactionId).toBe('t-spike')
      expect(finding.baselineAmount).toBe(400)
      expect(finding.amount).toBe(3500)
      expect(finding.absoluteDeviation).toBe(3100)
      expect(finding.ratio).toBe(Math.round((3500 / 400) * 10) / 10)
      expect(finding.severity).toBe('high')
      expect(finding.comparableTransactionIds).not.toContain('t-spike')
    })

    it('safely handles zero-variance baselines without NaN or divide-by-zero errors', () => {
      const txs: Transaction[] = [
        {
          id: 'zv-1',
          date: '2026-03-01',
          description: 'Gym Subscription',
          amount: 500,
          category: 'Health',
          type: 'expense',
        },
        {
          id: 'zv-2',
          date: '2026-03-15',
          description: 'Gym Subscription',
          amount: 500,
          category: 'Health',
          type: 'expense',
        },
        {
          id: 'zv-3',
          date: '2026-03-30',
          description: 'Gym Subscription',
          amount: 500,
          category: 'Health',
          type: 'expense',
        },
        {
          id: 'zv-spike',
          date: '2026-04-05',
          description: 'Gym Subscription Annual Gear',
          amount: 2200,
          category: 'Health',
          type: 'expense',
        },
      ]

      const res = detectSpendingAnomalies(txs, {}, { referenceDateStr: '2026-04-10' })
      expect(res.allFindings.length).toBe(1)
      const finding = res.allFindings[0]
      expect(finding.transactionId).toBe('zv-spike')
      expect(finding.baselineAmount).toBe(500)
      expect(Number.isFinite(finding.ratio)).toBe(true)
      expect(Number.isFinite(finding.absoluteDeviation)).toBe(true)
    })

    it('suppresses trivial deviations under the ₹300 noise floor', () => {
      const txs: Transaction[] = [
        {
          id: 'f-1',
          date: '2026-03-01',
          description: 'Tea Stall',
          amount: 30,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'f-2',
          date: '2026-03-10',
          description: 'Tea Stall',
          amount: 30,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'f-3',
          date: '2026-03-20',
          description: 'Tea Stall',
          amount: 30,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'f-spike',
          date: '2026-04-01',
          description: 'Tea Stall Special Snack',
          amount: 150,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      const res = detectSpendingAnomalies(txs, {}, { referenceDateStr: '2026-04-05' })
      expect(res.allFindings.length).toBe(0)
    })

    it('distinguishes merchant-level baseline from category-level baseline', () => {
      const txs: Transaction[] = [
        {
          id: 'm-1',
          date: '2026-03-01',
          description: 'Blue Tokai Coffee',
          amount: 250,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'm-2',
          date: '2026-03-10',
          description: 'Blue Tokai Coffee',
          amount: 260,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'm-3',
          date: '2026-03-20',
          description: 'Blue Tokai Coffee',
          amount: 240,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'm-spike',
          date: '2026-04-05',
          description: 'Blue Tokai Coffee',
          amount: 2100,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      const res = detectSpendingAnomalies(txs, {}, { referenceDateStr: '2026-04-10' })
      expect(res.allFindings.length).toBe(1)
      expect(res.allFindings[0].baselineMethod).toBe('merchant')
      expect(res.allFindings[0].ruleId).toBe('merchant_deviation')
    })

    it('reconciles reviewed and dismissed states and updates active summaries', () => {
      const txs: Transaction[] = [
        {
          id: 'rev-1',
          date: '2026-03-01',
          description: 'Flight Booking',
          amount: 2500,
          category: 'Travel',
          type: 'expense',
        },
        {
          id: 'rev-2',
          date: '2026-03-15',
          description: 'Train Ticket',
          amount: 2600,
          category: 'Travel',
          type: 'expense',
        },
        {
          id: 'rev-3',
          date: '2026-03-25',
          description: 'Bus Pass',
          amount: 2400,
          category: 'Travel',
          type: 'expense',
        },
        {
          id: 'rev-spike',
          date: '2026-04-02',
          description: 'International Flight',
          amount: 18000,
          category: 'Travel',
          type: 'expense',
        },
      ]

      const findingKey = getDeterministicFindingKey('rev-spike', 'category_deviation')

      const resActive = detectSpendingAnomalies(txs, {}, { referenceDateStr: '2026-04-05' })
      expect(resActive.activeFindings.length).toBe(1)
      expect(resActive.summary.spikesTotal).toBe(18000)

      const reviewsDismissed: Record<string, AnomalyReviewRecord> = {
        [findingKey]: {
          findingKey,
          transactionId: 'rev-spike',
          status: 'dismissed',
          reviewedAt: '2026-04-03T10:00:00.000Z',
          userNotes: 'Planned semester travel',
        },
      }
      const resDismissed = detectSpendingAnomalies(txs, reviewsDismissed, { referenceDateStr: '2026-04-05' })
      expect(resDismissed.activeFindings.length).toBe(0)
      expect(resDismissed.dismissedFindings.length).toBe(1)
      expect(resDismissed.summary.spikesTotal).toBe(0)
      expect(resDismissed.summary.dismissedCount).toBe(1)

      const reviewsAcknowledged: Record<string, AnomalyReviewRecord> = {
        [findingKey]: {
          findingKey,
          transactionId: 'rev-spike',
          status: 'reviewed',
          reviewedAt: '2026-04-03T10:00:00.000Z',
        },
      }
      const resReviewed = detectSpendingAnomalies(txs, reviewsAcknowledged, { referenceDateStr: '2026-04-05' })
      expect(resReviewed.activeFindings.length).toBe(0)
      expect(resReviewed.reviewedFindings.length).toBe(1)
      expect(resReviewed.summary.reviewedCount).toBe(1)
    })
  })

  describe('compareCategoryPeriodSpending (burn rate normalization)', () => {
    it('normalizes spending by period days and detects surge', () => {
      const txs: Transaction[] = [
        {
          id: 'c-1',
          date: '2026-03-10',
          description: 'Dining',
          amount: 4500,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'c-2',
          date: '2026-03-25',
          description: 'Dining',
          amount: 4500,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'c-3',
          date: '2026-04-05',
          description: 'Party Dining',
          amount: 7000,
          category: 'Food & Dining',
          type: 'expense',
        },
        {
          id: 'c-4',
          date: '2026-04-12',
          description: 'Buffet',
          amount: 7000,
          category: 'Food & Dining',
          type: 'expense',
        },
      ]

      const comparison = compareCategoryPeriodSpending(txs, 'Food & Dining', '2026-04-14', 14, 30)
      expect(comparison.currentSpending).toBe(14000)
      expect(comparison.baselineSpending).toBe(9000)
      expect(comparison.dailyCurrentRate).toBe(1000)
      expect(comparison.dailyBaselineRate).toBe(300)
      expect(comparison.rateRatio).toBe(3.3)
      expect(comparison.isSurge).toBe(true)
      expect(comparison.isProRated).toBe(true)
    })
  })
})
