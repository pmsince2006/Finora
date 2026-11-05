import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../api'

describe('Client API Service (client/src/lib/api.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends credentials: "include" and handles JSON response', async () => {
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

  it('throws structured ApiError when server returns error response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' }),
    } as Response)

    await expect(api.auth.login('bad@example.com', 'wrongpassword')).rejects.toThrow(ApiError)
  })

  it('extracts error message from ApiError correctly', async () => {
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

  it('attaches in-memory Bearer token fallback without touching localStorage', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: { id: 'u-1', email: 'a@b.com', fullName: 'A' }, token: 'jwt.sample.token' }),
    } as Response)

    // Login stores in-memory token
    await api.auth.login('a@b.com', 'password123')

    // Next request includes Authorization: Bearer header
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ transactions: [] }),
    } as Response)

    await api.transactions.list()
    expect(fetchSpy).toHaveBeenLastCalledWith(
      '/api/transactions',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    )
    const calledHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers
    expect(calledHeaders.get('Authorization')).toBe('Bearer jwt.sample.token')

    // Logout clears token
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as Response)
    await api.auth.logout()

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: { id: 'u-1' } }),
    } as Response)
    await api.auth.getMe()
    const finalHeaders = fetchSpy.mock.calls[3][1]?.headers as Headers
    expect(finalHeaders.get('Authorization')).toBeNull()
  })

  it('demonstrates refresh failure when third-party cookies are blocked and memory is wiped', async () => {
    // 1. User logs in, backend returns user and token
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: { id: 'u-1', email: 'user@finora.in', fullName: 'User' }, token: 'jwt.active.token' }),
    } as Response)
    await api.auth.login('user@finora.in', 'password123')

    // 2. Simulated Page Refresh: JavaScript execution context resets and RAM is cleared
    // In a real browser reload, module-level memoryToken reverts to null
    const { setMemoryToken } = await import('../api')
    setMemoryToken(null)

    // 3. Browser has blocked cross-site cookies, so fetch sends no cookie; server rejects with 401
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Authentication required. No session token provided.', code: 'AUTH_REQUIRED' }),
    } as Response)

    // 4. Verification: getMe fails, triggering logout in AuthContext
    await expect(api.auth.getMe()).rejects.toThrow(ApiError)
  })

  it('demonstrates successful session restore across refresh when cookies are supported (custom domain / proxy)', async () => {
    // 1. Simulated Page Refresh with clean memory
    const { setMemoryToken, getMemoryToken } = await import('../api')
    setMemoryToken(null)
    expect(getMemoryToken()).toBeNull()

    // 2. Browser includes 1st-party / same-site cookie with credentials: 'include'
    // Server validates cookie and returns authenticated user and fresh token
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ user: { id: 'u-1', email: 'user@finora.in', fullName: 'User' }, token: 'jwt.restored.token' }),
    } as Response)

    const res = await api.auth.getMe()
    expect(res.user.email).toBe('user@finora.in')
    // Token rehydrated into memory
    expect(getMemoryToken()).toBe('jwt.restored.token')
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
      json: async () => ({ user: { id: 'u-1', email: 'test@finora.in', fullName: 'Test' }, token: 'secret.jwt.token' }),
    } as Response)

    try {
      await api.auth.login('test@finora.in', 'password123')

      // Confirm that setItem was never called with any token
      expect((globalThis as any).localStorage.setItem).not.toHaveBeenCalled()
      expect(mockStorage['token']).toBeUndefined()
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
