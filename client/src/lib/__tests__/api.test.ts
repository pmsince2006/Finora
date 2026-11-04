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
})
