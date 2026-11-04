import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import './setup.js'

describe('Backend Transactions API (/api/transactions)', () => {
  let userACookie: string[]
  let userBCookie: string[]

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      fullName: 'User Alpha',
      email: 'alpha@example.com',
      password: 'Password123!',
    })
    userACookie = resA.headers['set-cookie'] as string[]

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      fullName: 'User Beta',
      email: 'beta@example.com',
      password: 'Password123!',
    })
    userBCookie = resB.headers['set-cookie'] as string[]
  })

  it('blocks unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/transactions')
    expect(res.status).toBe(401)
  })

  it('creates and lists transactions scoped to the authenticated user', async () => {
    const newTx = {
      id: 'tx-alpha-1',
      description: 'Swiggy Dinner',
      amount: 450,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-04-12',
    }

    const createRes = await request(app)
      .post('/api/transactions')
      .set('Cookie', userACookie)
      .send(newTx)

    expect(createRes.status).toBe(201)
    expect(createRes.body.transaction.id).toBe('tx-alpha-1')
    expect(createRes.body.transaction.amount).toBe(450)

    const listRes = await request(app)
      .get('/api/transactions')
      .set('Cookie', userACookie)

    expect(listRes.status).toBe(200)
    expect(listRes.body.transactions).toHaveLength(1)
    expect(listRes.body.transactions[0].id).toBe('tx-alpha-1')
  })

  it('rejects invalid transaction data (negative amounts, bad date format, missing category)', async () => {
    const badAmount = await request(app)
      .post('/api/transactions')
      .set('Cookie', userACookie)
      .send({
        description: 'Negative Charge',
        amount: -100,
        type: 'expense',
        category: 'Shopping',
        date: '2026-04-10',
      })
    expect(badAmount.status).toBe(400)

    const badDate = await request(app)
      .post('/api/transactions')
      .set('Cookie', userACookie)
      .send({
        description: 'Bad Date',
        amount: 250,
        type: 'expense',
        category: 'Shopping',
        date: '04/10/2026', // Not YYYY-MM-DD
      })
    expect(badDate.status).toBe(400)

    const missingCategory = await request(app)
      .post('/api/transactions')
      .set('Cookie', userACookie)
      .send({
        description: 'No Category',
        amount: 250,
        type: 'expense',
        category: '  ',
        date: '2026-04-10',
      })
    expect(missingCategory.status).toBe(400)
  })

  it('strictly isolates User A and User B data (User B cannot read, edit, or delete User A transactions)', async () => {
    // User A creates a transaction
    await request(app)
      .post('/api/transactions')
      .set('Cookie', userACookie)
      .send({
        id: 'tx-secret-alpha',
        description: 'Alpha Private Expense',
        amount: 1500,
        type: 'expense',
        category: 'Personal Care',
        date: '2026-04-05',
      })

    // User B lists transactions -> should be empty
    const listB = await request(app)
      .get('/api/transactions')
      .set('Cookie', userBCookie)
    expect(listB.status).toBe(200)
    expect(listB.body.transactions).toHaveLength(0)

    // User B attempts to edit User A's transaction
    const editAttempt = await request(app)
      .put('/api/transactions/tx-secret-alpha')
      .set('Cookie', userBCookie)
      .send({
        description: 'Hacked Alpha Tx',
        amount: 9999,
        type: 'expense',
        category: 'Personal Care',
        date: '2026-04-05',
      })
    expect(editAttempt.status).toBe(404)

    // User B attempts to delete User A's transaction
    const deleteAttempt = await request(app)
      .delete('/api/transactions/tx-secret-alpha')
      .set('Cookie', userBCookie)
    expect(deleteAttempt.status).toBe(404)

    // Verify User A still has their transaction untouched
    const listA = await request(app)
      .get('/api/transactions')
      .set('Cookie', userACookie)
    expect(listA.body.transactions).toHaveLength(1)
    expect(listA.body.transactions[0].amount).toBe(1500)
  })

  it('updates and deletes a transaction owned by the authenticated user', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Cookie', userACookie)
      .send({
        id: 'tx-to-update',
        description: 'Coffee',
        amount: 120,
        type: 'expense',
        category: 'Food & Dining',
        date: '2026-04-01',
      })

    // Update
    const updateRes = await request(app)
      .put('/api/transactions/tx-to-update')
      .set('Cookie', userACookie)
      .send({
        description: 'Specialty Coffee',
        amount: 180,
        type: 'expense',
        category: 'Food & Dining',
        date: '2026-04-01',
      })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.transaction.description).toBe('Specialty Coffee')
    expect(updateRes.body.transaction.amount).toBe(180)

    // Delete
    const deleteRes = await request(app)
      .delete('/api/transactions/tx-to-update')
      .set('Cookie', userACookie)
    expect(deleteRes.status).toBe(200)

    // Verify gone
    const listRes = await request(app)
      .get('/api/transactions')
      .set('Cookie', userACookie)
    expect(listRes.body.transactions).toHaveLength(0)
  })

  it('supports batch transaction creation (CSV import simulation)', async () => {
    const batch = [
      { id: 'b-1', description: 'Metro Card', amount: 500, type: 'expense', category: 'Travel & Commute', date: '2026-04-02' },
      { id: 'b-2', description: 'Grocery Store', amount: 1200, type: 'expense', category: 'Food & Dining', date: '2026-04-03' },
    ]

    const batchRes = await request(app)
      .post('/api/transactions/batch')
      .set('Cookie', userACookie)
      .send({ transactions: batch })

    expect(batchRes.status).toBe(201)
    expect(batchRes.body.importedCount).toBe(2)

    const listRes = await request(app)
      .get('/api/transactions')
      .set('Cookie', userACookie)
    expect(listRes.body.transactions).toHaveLength(2)
  })
})
