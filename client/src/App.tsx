import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/app/AppLayout'
import { FinanceProvider } from './context/FinanceContext'
import { ToastProvider } from './context/ToastContext'

// Route-level code splitting with named export compatibility
const LandingPage = React.lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const LoginPage = React.lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = React.lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const OverviewPage = React.lazy(() =>
  import('./pages/app/OverviewPage').then((m) => ({ default: m.OverviewPage }))
)
const TransactionsPage = React.lazy(() =>
  import('./pages/app/TransactionsPage').then((m) => ({ default: m.TransactionsPage }))
)
const RecurringPage = React.lazy(() =>
  import('./pages/app/RecurringPage').then((m) => ({ default: m.RecurringPage }))
)
const InvestigationsPage = React.lazy(() =>
  import('./pages/app/InvestigationsPage').then((m) => ({ default: m.InvestigationsPage }))
)
const SavingsPage = React.lazy(() =>
  import('./pages/app/SavingsPage').then((m) => ({ default: m.SavingsPage }))
)
const SettingsPage = React.lazy(() =>
  import('./pages/app/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

/**
 * Accessible, lightweight fallback for dynamically loaded route chunks.
 * Avoids layout shift and visual clutter.
 */
export const RouteLoadingFallback: React.FC = () => (
  <div
    className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-xs font-mono text-[#62726A]"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-2 h-2 rounded-full bg-[#153326] animate-pulse" />
      <span>Loading Finora...</span>
    </div>
  </div>
)

interface RouteErrorBoundaryProps {
  children: React.ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
}

/**
 * Resilient boundary protecting against chunk load network errors
 * without corrupting local state or showing misleading auth failures.
 */
class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] font-mono text-base font-bold">
            !
          </div>
          <h2 className="text-base font-serif text-[#16201B]">Unable to load view</h2>
          <p className="text-xs text-[#62726A] max-w-sm">
            A network issue prevented loading this section. Your recorded transactions and settings remain safe.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#153326] text-[#FFFFFF] text-xs font-medium rounded-lg hover:bg-[#1E4D38] transition-colors cursor-pointer"
          >
            Reload Section
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RouteErrorBoundary>
          <React.Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Phase 01 Preserved Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Dedicated Dark Authentication Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Application Workspace with Finance Context */}
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
          </React.Suspense>
        </RouteErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
