import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { AppLayout } from './components/app/AppLayout'
import { OverviewPage } from './pages/app/OverviewPage'
import { TransactionsPage } from './pages/app/TransactionsPage'
import { RecurringPage } from './pages/app/RecurringPage'
import { InvestigationsPage } from './pages/app/InvestigationsPage'
import { SavingsPage } from './pages/app/SavingsPage'
import { SettingsPage } from './pages/app/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { FinanceProvider } from './context/FinanceContext'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phase 01 Preserved Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Phase 02 Authenticated-Style Application Workspace */}
        <Route
          path="/app"
          element={
            <FinanceProvider>
              <AppLayout />
            </FinanceProvider>
          }
        >
          {/* Default Route: Overview Dashboard */}
          <Route index element={<OverviewPage />} />
          {/* Money Ledger */}
          <Route path="transactions" element={<TransactionsPage />} />
          {/* Recurring Payment Detective */}
          <Route path="recurring" element={<RecurringPage />} />
          {/* Spending Anomaly Radar */}
          <Route path="investigations" element={<InvestigationsPage />} />
          {/* Savings Opportunity Lab */}
          <Route path="savings" element={<SavingsPage />} />
          {/* Settings & Local Controls */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
