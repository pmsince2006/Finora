import { useContext } from 'react'
import { FinanceContext } from './financeContextDef'
import type { FinanceContextType } from './financeContextDef'

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
