import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import './setup.js'

describe('Backend Reviews API (/api/reviews)', () => {
  let userACookie: string[]
  let userBCookie: string[]

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      fullName: 'Reviewer A',
      email: 'rev.a@example.com',
      password: 'Password123!',
    })
    userACookie = resA.headers['set-cookie'] as string[]

    const resB = await request(app).post('/api/auth/register').send({
      fullName: 'Reviewer B',
      email: 'rev.b@example.com',
      password: 'Password123!',
    })
    userBCookie = resB.headers['set-cookie'] as string[]
  })

  it('manages recurring review decisions per user', async () => {
    // Save a confirmed recurring review for Cult.fit
    const saveRes = await request(app)
      .post('/api/reviews/recurring')
      .set('Cookie', userACookie)
      .send({
        candidateKey: 'rec-cult fit gym',
        status: 'confirmed',
        reviewedAt: '2026-04-15T10:00:00.000Z',
      })
    expect(saveRes.status).toBe(200)
    expect(saveRes.body.recurringReviews['rec-cult fit gym'].status).toBe('confirmed')

    // User B gets reviews -> should be empty
    const resB = await request(app)
      .get('/api/reviews')
      .set('Cookie', userBCookie)
    expect(resB.status).toBe(200)
    expect(Object.keys(resB.body.recurringReviews)).toHaveLength(0)

    // User A removes recurring review
    const delRes = await request(app)
      .delete('/api/reviews/recurring/rec-cult fit gym')
      .set('Cookie', userACookie)
    expect(delRes.status).toBe(200)
    expect(delRes.body.recurringReviews['rec-cult fit gym']).toBeUndefined()
  })

  it('manages spending anomaly review decisions per user', async () => {
    const saveRes = await request(app)
      .post('/api/reviews/anomaly')
      .set('Cookie', userACookie)
      .send({
        findingKey: 'anom-tx-123-outlier',
        transactionId: 'tx-123',
        status: 'reviewed',
        reviewedAt: '2026-04-16T12:00:00.000Z',
      })
    expect(saveRes.status).toBe(200)
    expect(saveRes.body.anomalyReviews['anom-tx-123-outlier'].status).toBe('reviewed')

    // Reset anomaly reviews
    const resetRes = await request(app)
      .delete('/api/reviews/anomaly')
      .set('Cookie', userACookie)
    expect(resetRes.status).toBe(200)
    expect(Object.keys(resetRes.body.anomalyReviews)).toHaveLength(0)
  })

  it('manages savings opportunity plans, targets, and dismissals per user', async () => {
    const saveRes = await request(app)
      .post('/api/reviews/savings')
      .set('Cookie', userACookie)
      .send({
        opportunityKey: 'sav-cat-food-dining',
        status: 'planned',
        reviewedAt: '2026-04-17T09:00:00.000Z',
        customTargetPercent: 12,
      })
    expect(saveRes.status).toBe(200)
    expect(saveRes.body.savingsReviews['sav-cat-food-dining'].status).toBe('planned')
    expect(saveRes.body.savingsReviews['sav-cat-food-dining'].customTargetPercent).toBe(12)

    // Retrieve via /api/reviews
    const getRes = await request(app)
      .get('/api/reviews')
      .set('Cookie', userACookie)
    expect(getRes.status).toBe(200)
    expect(getRes.body.savingsReviews['sav-cat-food-dining'].status).toBe('planned')
  })

  it('supports bulk review synchronization for client-to-cloud migration', async () => {
    const syncPayload = {
      recurringReviews: {
        'rec-netflix': { candidateKey: 'rec-netflix', status: 'confirmed', reviewedAt: '2026-04-10' },
      },
      anomalyReviews: {
        'anom-tx-99': { findingKey: 'anom-tx-99', transactionId: 'tx-99', status: 'dismissed', reviewedAt: '2026-04-11' },
      },
      savingsReviews: {
        'sav-cat-shopping': { opportunityKey: 'sav-cat-shopping', status: 'saved', reviewedAt: '2026-04-12' },
      },
    }

    const syncRes = await request(app)
      .post('/api/reviews/sync')
      .set('Cookie', userACookie)
      .send(syncPayload)

    expect(syncRes.status).toBe(200)
    expect(syncRes.body.recurringReviews['rec-netflix']).toBeDefined()
    expect(syncRes.body.anomalyReviews['anom-tx-99']).toBeDefined()
    expect(syncRes.body.savingsReviews['sav-cat-shopping']).toBeDefined()
  })
})
