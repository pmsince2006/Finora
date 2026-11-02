import { describe, it, expect } from 'vitest'

describe('Route module smoke checks', () => {
  it('imports LandingPage dynamically without syntax or export errors', async () => {
    const mod = await import('../LandingPage')
    expect(typeof mod.LandingPage).toBe('function')
  })

  it('imports LoginPage dynamically without syntax or export errors', async () => {
    const mod = await import('../LoginPage')
    expect(typeof mod.LoginPage).toBe('function')
  })

  it('imports RegisterPage dynamically without syntax or export errors', async () => {
    const mod = await import('../RegisterPage')
    expect(typeof mod.RegisterPage).toBe('function')
  })

  it('imports NotFoundPage dynamically without syntax or export errors', async () => {
    const mod = await import('../NotFoundPage')
    expect(typeof mod.NotFoundPage).toBe('function')
  })

  it('imports OverviewPage dynamically without syntax or export errors', async () => {
    const mod = await import('../app/OverviewPage')
    expect(typeof mod.OverviewPage).toBe('function')
  })

  it('imports TransactionsPage dynamically without syntax or export errors', async () => {
    const mod = await import('../app/TransactionsPage')
    expect(typeof mod.TransactionsPage).toBe('function')
  })

  it('imports RecurringPage dynamically without syntax or export errors', async () => {
    const mod = await import('../app/RecurringPage')
    expect(typeof mod.RecurringPage).toBe('function')
  })

  it('imports InvestigationsPage dynamically without syntax or export errors', async () => {
    const mod = await import('../app/InvestigationsPage')
    expect(typeof mod.InvestigationsPage).toBe('function')
  })

  it('imports SavingsPage dynamically without syntax or export errors', async () => {
    const mod = await import('../app/SavingsPage')
    expect(typeof mod.SavingsPage).toBe('function')
  })

  it('imports SettingsPage dynamically without syntax or export errors', async () => {
    const mod = await import('../app/SettingsPage')
    expect(typeof mod.SettingsPage).toBe('function')
  })
})
