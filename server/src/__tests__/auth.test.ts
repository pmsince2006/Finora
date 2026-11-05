import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import './setup.js'

describe('Backend Auth API (/api/auth)', () => {
  const validUser = {
    fullName: 'Rohan Sharma',
    email: 'Rohan.Sharma@example.com',
    password: 'Password123!',
  }

  it('registers a new user, hashes password, and sets session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)

    expect(res.status).toBe(201)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe('rohan.sharma@example.com') // Normalized to lowercase
    expect(res.body.user.fullName).toBe('Rohan Sharma')
    expect(res.body.user.password).toBeUndefined() // Password hash never exposed

    // Check Set-Cookie header contains finora_session HttpOnly cookie
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    const sessionCookie = (cookies as string[]).find((c) => c.startsWith('finora_session='))
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toContain('HttpOnly')
  })

  it('prevents duplicate email registration safely with 409', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(validUser)

    // Attempt second registration with same email (different case)
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Rohan Duplicate',
        email: 'ROHAN.SHARMA@EXAMPLE.COM',
        password: 'DifferentPassword123!',
      })

    expect(res.status).toBe(409)
    expect(res.body.error).toContain('already exists')
  })

  it('rejects registration with invalid email or weak password', async () => {
    const badEmail = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Bad Email', email: 'not-an-email', password: 'Password123!' })
    expect(badEmail.status).toBe(400)

    const shortPassword = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Short Pwd', email: 'valid@example.com', password: 'short' })
    expect(shortPassword.status).toBe(400)
  })

  it('authenticates existing user and rejects incorrect credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser)

    // Incorrect password
    const wrongPwd = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword!' })
    expect(wrongPwd.status).toBe(401)
    expect(wrongPwd.body.error).toContain('Invalid email or password')

    // Nonexistent email
    const noUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123!' })
    expect(noUser.status).toBe(401)

    // Correct login
    const success = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rohan.sharma@example.com', password: validUser.password })
    expect(success.status).toBe(200)
    expect(success.body.user.email).toBe('rohan.sharma@example.com')
  })

  it('restores user session via /api/auth/me using HttpOnly cookie', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUser)
    const cookies = regRes.headers['set-cookie'] as string[]

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies)

    expect(meRes.status).toBe(200)
    expect(meRes.body.user.email).toBe('rohan.sharma@example.com')
    expect(meRes.body.token).toBeDefined()
  })

  it('authenticates via Authorization: Bearer header when cookie is absent', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUser)
    const token = regRes.body.token
    expect(token).toBeDefined()

    // Request WITHOUT any Cookie header, only Authorization: Bearer
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(meRes.status).toBe(200)
    expect(meRes.body.user.email).toBe('rohan.sharma@example.com')
  })

  it('rejects /api/auth/me when session cookie is absent or invalid', async () => {
    const unauth = await request(app).get('/api/auth/me')
    expect(unauth.status).toBe(401)

    const fakeCookie = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['finora_session=invalid.token.here'])
    expect(fakeCookie.status).toBe(401)
  })

  it('clears session cookie on logout', async () => {
    const logoutRes = await request(app).post('/api/auth/logout')
    expect(logoutRes.status).toBe(200)

    const cookies = logoutRes.headers['set-cookie'] as string[]
    const sessionCookie = cookies?.find((c) => c.startsWith('finora_session='))
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toMatch(/finora_session=;|Expires=Thu, 01 Jan 1970/i)
  })
})
