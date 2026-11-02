import { describe, it, expect } from 'vitest'
import {
  detectCadence,
  projectNextDate,
  calculateEquivalents,
  detectRecurringPayments,
  getDaysInMonth,
  addDays,
  addMonths,
  getDayDifference,
} from '../recurringDetection'
import { getDeterministicCandidateKey, type RecurringReviewRecord } from '../recurringStorage'
import type { Transaction } from '../../types/finance'

describe('recurringDetection', () => {
  describe('date utility helpers', () => {
    it('calculates correct days in month including leap years', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29)
      expect(getDaysInMonth(2026, 2)).toBe(28)
      expect(getDaysInMonth(2026, 4)).toBe(30)
      expect(getDaysInMonth(2026, 12)).toBe(31)
    })

    it('adds days accurately across month boundaries', () => {
      expect(addDays('2026-03-28', 5)).toBe('2026-04-02')
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    })

    it('adds months with end-of-month clamping', () => {
      expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
      expect(addMonths('2026-08-31', 1)).toBe('2026-09-30')
      expect(addMonths('2026-01-15', 3)).toBe('2026-04-15')
    })

    it('computes integer day differences', () => {
      expect(getDayDifference('2026-04-01', '2026-04-10')).toBe(9)
      expect(getDayDifference('2026-04-10', '2026-04-01')).toBe(-9)
      expect(getDayDifference('2026-04-01', '2026-04-01')).toBe(0)
    })
  })

  describe('detectCadence', () => {
    it('returns Irregular / Uncertain for fewer than 2 dates', () => {
      expect(detectCadence([])).toEqual({
        cadence: 'Irregular / Uncertain',
        cadenceConsistency: 'irregular',
        avgIntervalDays: 0,
      })
      expect(detectCadence(['2026-01-01'])).toEqual({
        cadence: 'Irregular / Uncertain',
        cadenceConsistency: 'irregular',
        avgIntervalDays: 0,
      })
    })

    it('detects weekly cadence for ~7 day intervals', () => {
      const dates = ['2026-04-01', '2026-04-08', '2026-04-15', '2026-04-22']
      const res = detectCadence(dates)
      expect(res.cadence).toBe('Weekly')
      expect(res.cadenceConsistency).toBe('regular')
      expect(res.avgIntervalDays).toBe(7)
    })

    it('detects fortnightly cadence for ~14 day intervals', () => {
      const dates = ['2026-03-01', '2026-03-15', '2026-03-29']
      const res = detectCadence(dates)
      expect(res.cadence).toBe('Fortnightly')
      expect(res.avgIntervalDays).toBe(14)
    })

    it('detects monthly cadence for consecutive calendar months with consistent day', () => {
      const dates = ['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']
      const res = detectCadence(dates)
      expect(res.cadence).toBe('Monthly')
      expect(res.cadenceConsistency).toBe('regular')
    })

    it('detects quarterly cadence for 3-month intervals', () => {
      const dates = ['2025-07-05', '2025-10-05', '2026-01-05', '2026-04-05']
      const res = detectCadence(dates)
      expect(res.cadence).toBe('Quarterly')
    })

    it('detects annual cadence for ~365 day intervals', () => {
      const dates = ['2024-03-10', '2025-03-10', '2026-03-10']
      const res = detectCadence(dates)
      expect(res.cadence).toBe('Annually')
    })

    it('flags irregular cadence when intervals fluctuate arbitrarily', () => {
      const dates = ['2026-01-01', '2026-01-05', '2026-02-20', '2026-02-25']
      const res = detectCadence(dates)
      expect(res.cadence).toBe('Irregular / Uncertain')
      expect(res.cadenceConsistency).toBe('irregular')
    })
  })

  describe('projectNextDate', () => {
    it('returns null for irregular cadences', () => {
      expect(projectNextDate('2026-04-01', 'Irregular / Uncertain')).toBeNull()
    })

    it('projects future monthly billing date', () => {
      const next = projectNextDate('2026-04-15', 'Monthly', '2026-04-20')
      expect(next).toBe('2026-05-15')
    })

    it('rolls forward past billing date when behind reference date', () => {
      const next = projectNextDate('2026-01-10', 'Monthly', '2026-04-05')
      expect(next).toBe('2026-04-10')
    })

    it('projects future weekly date correctly', () => {
      const next = projectNextDate('2026-04-10', 'Weekly', '2026-04-12')
      expect(next).toBe('2026-04-17')
    })
  })

  describe('calculateEquivalents', () => {
    it('calculates monthly and annual cost equivalents accurately', () => {
      expect(calculateEquivalents(1000, 'Monthly')).toEqual({
        monthlyEquivalent: 1000,
        annualEquivalent: 12000,
      })

      expect(calculateEquivalents(500, 'Weekly')).toEqual({
        monthlyEquivalent: 2167,
        annualEquivalent: 26000,
      })

      expect(calculateEquivalents(3000, 'Quarterly')).toEqual({
        monthlyEquivalent: 1000,
        annualEquivalent: 12000,
      })

      expect(calculateEquivalents(12000, 'Annually')).toEqual({
        monthlyEquivalent: 1000,
        annualEquivalent: 12000,
      })
    })
  })

  describe('detectRecurringPayments (full engine)', () => {
    it('ignores empty input and non-expense records', () => {
      const res = detectRecurringPayments([])
      expect(res.allCandidates).toEqual([])
      expect(res.summary.candidateCount).toBe(0)
      expect(res.summary.monthlyCommitment).toBe(0)

      const incomeTxs: Transaction[] = [
        {
          id: 'inc-1',
          date: '2026-01-01',
          description: 'Client Retainer',
          amount: 20000,
          category: 'Income',
          type: 'income',
        },
        {
          id: 'inc-2',
          date: '2026-02-01',
          description: 'Client Retainer',
          amount: 20000,
          category: 'Income',
          type: 'income',
        },
      ]
      expect(detectRecurringPayments(incomeTxs).allCandidates).toEqual([])
    })

    it('requires minimum 2 occurrences to form a recurring pattern (single purchase ignored)', () => {
      const singleTx: Transaction[] = [
        {
          id: 'tx-solo',
          date: '2026-04-10',
          description: 'Spotify Premium Individual',
          amount: 119,
          category: 'Digital Services',
          type: 'expense',
        },
      ]
      const res = detectRecurringPayments(singleTx)
      expect(res.allCandidates.length).toBe(0)
    })

    it('identifies monthly recurring subscription and computes deterministic candidate key', () => {
      const spotifyTxs: Transaction[] = [
        {
          id: 'sp-1',
          date: '2026-01-14',
          description: 'Spotify India Ltd',
          amount: 119,
          category: 'Digital Services',
          type: 'expense',
        },
        {
          id: 'sp-2',
          date: '2026-02-14',
          description: 'Spotify India Ltd',
          amount: 119,
          category: 'Digital Services',
          type: 'expense',
        },
        {
          id: 'sp-3',
          date: '2026-03-14',
          description: 'Spotify India Ltd',
          amount: 119,
          category: 'Digital Services',
          type: 'expense',
        },
      ]

      const res = detectRecurringPayments(spotifyTxs, {}, '2026-03-20')
      expect(res.allCandidates.length).toBe(1)

      const cand = res.allCandidates[0]
      expect(cand.merchant).toBe('Spotify India Ltd')
      expect(cand.cadence).toBe('Monthly')
      expect(cand.occurrenceCount).toBe(3)
      expect(cand.averageAmount).toBe(119)
      expect(cand.monthlyEquivalent).toBe(119)
      expect(cand.annualEquivalent).toBe(119 * 12)
      expect(cand.amountVariability).toBe('exact')
      expect(cand.reviewStatus).toBe('suggested')
      expect(cand.candidateKey).toBe(getDeterministicCandidateKey('spotify india ltd'))
    })

    it('applies confirmed review state: increases confidence to 1.0 and sets Confirmed status', () => {
      const netflixTxs: Transaction[] = [
        {
          id: 'nf-1',
          date: '2026-02-05',
          description: 'Netflix Entertainment',
          amount: 649,
          category: 'Digital Services',
          type: 'expense',
        },
        {
          id: 'nf-2',
          date: '2026-03-05',
          description: 'Netflix Entertainment',
          amount: 649,
          category: 'Digital Services',
          type: 'expense',
        },
      ]

      const candKey = getDeterministicCandidateKey('netflix entertainment')
      const reviews: Record<string, RecurringReviewRecord> = {
        [candKey]: {
          candidateKey: candKey,
          status: 'confirmed',
          reviewedAt: '2026-03-10T10:00:00.000Z',
          userNotes: 'Standard 4K Plan',
        },
      }

      const res = detectRecurringPayments(netflixTxs, reviews, '2026-03-20')
      expect(res.confirmedCandidates.length).toBe(1)
      expect(res.confirmedCandidates[0].confidence).toBe(1.0)
      expect(res.confirmedCandidates[0].status).toBe('Confirmed')
      expect(res.confirmedCandidates[0].reviewStatus).toBe('confirmed')
      expect(res.summary.reviewStats?.confirmedCount).toBe(1)
    })

    it('excludes dismissed candidate from active commitments and count', () => {
      const gymTxs: Transaction[] = [
        {
          id: 'gym-1',
          date: '2026-01-01',
          description: 'Cult Fit Gym',
          amount: 1500,
          category: 'Health',
          type: 'expense',
        },
        {
          id: 'gym-2',
          date: '2026-02-01',
          description: 'Cult Fit Gym',
          amount: 1500,
          category: 'Health',
          type: 'expense',
        },
      ]

      const candKey = getDeterministicCandidateKey('cult fit gym')
      const reviews: Record<string, RecurringReviewRecord> = {
        [candKey]: {
          candidateKey: candKey,
          status: 'dismissed',
          reviewedAt: '2026-02-15T12:00:00.000Z',
        },
      }

      const res = detectRecurringPayments(gymTxs, reviews, '2026-02-15')
      expect(res.dismissedCandidates.length).toBe(1)
      expect(res.activeCandidates.length).toBe(0)
      expect(res.summary.candidateCount).toBe(0)
      expect(res.summary.monthlyCommitment).toBe(0)
      expect(res.summary.reviewStats?.dismissedCount).toBe(1)
    })

    it('correctly aggregates upcoming charges within the next 30 days window', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-a1',
          date: '2026-03-10',
          description: 'Broadband Fiber',
          amount: 999,
          category: 'Utilities',
          type: 'expense',
        },
        {
          id: 'tx-a2',
          date: '2026-04-10',
          description: 'Broadband Fiber',
          amount: 999,
          category: 'Utilities',
          type: 'expense',
        },
      ]

      const res = detectRecurringPayments(txs, {}, '2026-04-15')
      expect(res.summary.upcomingCharges30Days?.length).toBe(1)
      expect(res.summary.upcomingCharges30Days?.[0].merchant).toBe('Broadband Fiber')
      expect(res.summary.upcomingCharges30Days?.[0].date).toBe('2026-05-10')
      expect(res.summary.upcomingCharges30Days?.[0].amount).toBe(999)
    })
  })
})
