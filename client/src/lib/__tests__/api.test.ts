import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../api'

describe('Client API Service (client/src/lib/api.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends credentials: "include" and handles JSON response on api.auth.getMe()', async () => {
    const mockUser = { id: 'u-123', email: 'test@finora.internal', fullName: 'Test Finora' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: mockUser }),
    } as Response)

    const res = await api.auth.getMe()
    expect(res.user.email).toBe('test@finora.internal')
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
      })
    )
  })

  it('throws structured ApiError when server returns error response on login', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' }),
    } as Response)

    await expect(api.auth.login('bad@example.com', 'wrongpassword')).rejects.toThrow(ApiError)
  })

  it('extracts error message from ApiError correctly on registration failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 409,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'An account with this email already exists.', code: 'EMAIL_ALREADY_EXISTS' }),
    } as Response)

    try {
      await api.auth.register('Jane Doe', 'jane@example.com', 'Password123!')
      expect.fail('Should have thrown')
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError)
      expect(err.statusCode).toBe(409)
      expect(err.code).toBe('EMAIL_ALREADY_EXISTS')
      expect(err.message).toBe('An account with this email already exists.')
    }
  })

  it('executes registration and login using cookie-based transport with credentials: "include"', async () => {
    const mockUser = { id: 'u-1', email: 'user@finora.in', fullName: 'Test User' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ user: mockUser, message: 'Account registered successfully.' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ user: mockUser, message: 'Signed in successfully.' }),
      } as Response)

    const regRes = await api.auth.register('Test User', 'user@finora.in', 'Password123!')
    expect(regRes.user.email).toBe('user@finora.in')
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      '/api/auth/register',
      expect.objectContaining({ credentials: 'include', method: 'POST' })
    )

    const loginRes = await api.auth.login('user@finora.in', 'Password123!')
    expect(loginRes.user.email).toBe('user@finora.in')
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      '/api/auth/login',
      expect.objectContaining({ credentials: 'include', method: 'POST' })
    )
  })

  it('restores user session across page refresh via cookie-based api.auth.getMe()', async () => {
    const mockUser = { id: 'u-1', email: 'user@finora.in', fullName: 'Refreshed User' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: mockUser }),
    } as Response)

    const res = await api.auth.getMe()
    expect(res.user.fullName).toBe('Refreshed User')
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
      })
    )
  })

  it('clears session on logout via api.auth.logout() with credentials: "include"', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, message: 'Signed out successfully.' }),
    } as Response)

    const res = await api.auth.logout()
    expect(res.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
      })
    )
  })

  it('rejects with ApiError when session cookie is absent, expired, or invalid', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Authentication required. No session token provided.', code: 'AUTH_REQUIRED' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' }),
      } as Response)

    // Unauthenticated
    await expect(api.auth.getMe()).rejects.toThrow(ApiError)

    // Expired cookie
    await expect(api.auth.getMe()).rejects.toThrow(ApiError)
  })

  it('never writes authentication tokens to localStorage or sessionStorage', async () => {
    const mockStorage: Record<string, string> = {}
    const originalLocalStorage = (globalThis as any).localStorage
    ;(globalThis as any).localStorage = {
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val
      }),
      getItem: vi.fn((key: string) => mockStorage[key] || null),
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: { id: 'u-1', email: 'test@finora.in', fullName: 'Test' } }),
    } as Response)

    try {
      await api.auth.login('test@finora.in', 'password123')

      // Confirm that setItem was never called
      expect((globalThis as any).localStorage.setItem).not.toHaveBeenCalled()
      expect(mockStorage['token']).toBeUndefined()
      expect(mockStorage['finora_session']).toBeUndefined()
    } finally {
      ;(globalThis as any).localStorage = originalLocalStorage
    }
  })

  it('uses same-origin /api path and preserves query parameters without baseUrl prefix', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ transaction: { id: 'tx-100', description: 'Groceries', amount: 500 } }),
    } as Response)

    await api.transactions.update('tx-100', { description: 'Updated Groceries' } as any)

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/transactions/tx-100',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'include',
      })
    )
  })
})
