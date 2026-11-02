/**
 * Finora Authentication Service (Client-Side Interface)
 * 
 * Provides client-side validation and authentication state definitions.
 * Real server-managed endpoints (JWT in HTTP-only cookies / Bearer auth)
 * will connect once the Express/MongoDB backend is active.
 */

export interface UserCredentials {
  email: string
  password?: string
  fullName?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return 'Please enter your email address.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Please enter a password.'
  if (password.length < 8) return 'Password must be at least 8 characters long.'
  return null
}

export function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Please enter your full name.'
  if (trimmed.length < 2) return 'Name must be at least 2 characters.'
  return null
}

export function validateRegistration(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  const errors: Record<string, string> = {}

  const nameError = validateName(fullName)
  if (nameError) errors.fullName = nameError

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateLogin(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const AUTH_SYSTEM_STATUS = {
  isBackendConnected: false,
  message:
    'Finora is currently operating in local preview mode. Server-managed authentication will connect with the backend service.',
}
