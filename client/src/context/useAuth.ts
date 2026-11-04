import { useContext } from 'react'
import { AuthContext, type AuthContextType } from './authContextDef'

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  return context || defaultAuthContext
}
