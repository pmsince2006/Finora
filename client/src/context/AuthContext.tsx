import React, { useState, useEffect, useCallback } from 'react'
import { api, type UserProfile, ApiError } from '../lib/api'
import { AuthContext } from './authContextDef'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Verify active session with backend on initial load
  useEffect(() => {
    let isMounted = true

    async function checkAuthSession() {
      try {
        const data = await api.auth.getMe()
        if (isMounted) {
          setUser(data.user)
          setIsAuthenticated(true)
          setError(null)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuthSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await api.auth.login(email, password)
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please check your credentials.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await api.auth.register(fullName, email, password)
      setUser(data.user)
      setIsAuthenticated(true)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await api.auth.logout()
    } catch {
      // Logout even if backend network call fails
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
