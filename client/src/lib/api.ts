import type { Transaction } from '../types/finance'
import type { RecurringReviewRecord } from './recurringStorage'
import type { AnomalyReviewRecord } from './anomalyStorage'
import type { SavingsReviewRecord } from './savingsStorage'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export interface UserProfile {
  id: string
  email: string
  fullName: string
  createdAt?: string
}

export interface AuthResponse {
  user: UserProfile
  token?: string
  message?: string
}

export class ApiError extends Error {
  statusCode: number
  code?: string

  constructor(message: string, statusCode: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensures HttpOnly session cookies are transmitted
  })

  let data: any = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`
    throw new ApiError(errorMsg, response.status, data?.code)
  }

  return data as T
}

export const api = {
  // Authentication
  auth: {
    async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
      return request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      })
    },

    async login(email: string, password: string): Promise<AuthResponse> {
      return request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    async logout(): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST',
      })
    },

    async getMe(): Promise<{ user: UserProfile }> {
      return request<{ user: UserProfile }>('/api/auth/me', {
        method: 'GET',
      })
    },
  },

  // Transactions
  transactions: {
    async list(): Promise<{ transactions: Transaction[] }> {
      return request<{ transactions: Transaction[] }>('/api/transactions', {
        method: 'GET',
      })
    },

    async create(tx: Omit<Transaction, 'id'> & { id?: string }): Promise<{ transaction: Transaction }> {
      return request<{ transaction: Transaction }>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      })
    },

    async batchCreate(transactions: Transaction[]): Promise<{ importedCount: number; transactions: Transaction[] }> {
      return request<{ importedCount: number; transactions: Transaction[] }>('/api/transactions/batch', {
        method: 'POST',
        body: JSON.stringify({ transactions }),
      })
    },

    async update(id: string, updated: Partial<Transaction>): Promise<{ transaction: Transaction }> {
      return request<{ transaction: Transaction }>(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
      })
    },

    async delete(id: string): Promise<{ success: boolean; deletedTransaction: Transaction }> {
      return request<{ success: boolean; deletedTransaction: Transaction }>(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
    },

    async clearAll(): Promise<{ success: boolean; deletedCount: number }> {
      return request<{ success: boolean; deletedCount: number }>('/api/transactions', {
        method: 'DELETE',
      })
    },
  },

  // Reviews & Decisions
  reviews: {
    async getReviews(): Promise<{
      recurringReviews: Record<string, RecurringReviewRecord>
      anomalyReviews: Record<string, AnomalyReviewRecord>
      savingsReviews: Record<string, SavingsReviewRecord>
    }> {
      return request('/api/reviews', { method: 'GET' })
    },

    async syncAll(payload: {
      recurringReviews?: Record<string, RecurringReviewRecord>
      anomalyReviews?: Record<string, AnomalyReviewRecord>
      savingsReviews?: Record<string, SavingsReviewRecord>
    }): Promise<any> {
      return request('/api/reviews/sync', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async saveRecurring(record: RecurringReviewRecord): Promise<any> {
      return request('/api/reviews/recurring', {
        method: 'POST',
        body: JSON.stringify(record),
      })
    },

    async removeRecurring(candidateKey: string): Promise<any> {
      return request(`/api/reviews/recurring/${encodeURIComponent(candidateKey)}`, {
        method: 'DELETE',
      })
    },

    async resetRecurring(): Promise<any> {
      return request('/api/reviews/recurring', { method: 'DELETE' })
    },

    async saveAnomaly(record: AnomalyReviewRecord): Promise<any> {
      return request('/api/reviews/anomaly', {
        method: 'POST',
        body: JSON.stringify(record),
      })
    },

    async removeAnomaly(findingKey: string): Promise<any> {
      return request(`/api/reviews/anomaly/${encodeURIComponent(findingKey)}`, {
        method: 'DELETE',
      })
    },

    async resetAnomaly(): Promise<any> {
      return request('/api/reviews/anomaly', { method: 'DELETE' })
    },

    async saveSavings(record: SavingsReviewRecord): Promise<any> {
      return request('/api/reviews/savings', {
        method: 'POST',
        body: JSON.stringify(record),
      })
    },

    async removeSavings(opportunityKey: string): Promise<any> {
      return request(`/api/reviews/savings/${encodeURIComponent(opportunityKey)}`, {
        method: 'DELETE',
      })
    },

    async resetSavings(): Promise<any> {
      return request('/api/reviews/savings', { method: 'DELETE' })
    },
  },
}
