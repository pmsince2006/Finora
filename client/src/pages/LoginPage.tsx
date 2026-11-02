import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'
import { validateLogin } from '../services/authService'
import { formatCurrency } from '../lib/formatCurrency'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    const validation = validateLogin(email, password)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setIsLoading(true)

    // Simulate validation verification without claiming fake database connection
    setTimeout(() => {
      setIsLoading(false)
      setStatusMessage(
        'Client-side validation passed. Server authentication will be activated when the database backend is connected. You can enter the interactive demo workspace below.'
      )
    }, 400)
  }

  const handleEnterDemo = () => {
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-[#070E0B] text-[#F2F7F4] font-sans flex flex-col justify-between selection:bg-[#1B4332] selection:text-[#E3ECE8]">
      {/* Top minimal bar */}
      <header className="px-6 py-5 border-b border-[#14261D] max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <BrandLogo size="md" showTagline />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#74968C] hover:text-[#E3ECE8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container: Split Layout on Desktop */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-[#0D1A14] border border-[#193224] shadow-2xl overflow-hidden my-6">
          {/* Form Side (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <span className="text-[11px] font-mono tracking-wider text-[#74968C] uppercase block mb-1">
                  MEMBER ACCESS
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#FFFFFF] tracking-tight">
                  Welcome back.
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#8B9E94] leading-relaxed">
                  Log in to review your transactions, recurring payments, and active savings goals.
                </p>
              </div>

              {/* Status Notice if submitted */}
              {statusMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-[#142B20] border border-[#234D39] text-xs text-[#E3ECE8] space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#74968C] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-[#FFFFFF]">Local Preview Active</span>
                      <p className="text-[11px] text-[#A2B0A9] mt-0.5 leading-relaxed">
                        {statusMessage}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEnterDemo}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] text-[#FFFFFF] text-xs font-medium hover:bg-[#255C45] transition-all shadow-xs cursor-pointer"
                  >
                    <span>Enter Interactive Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-[#A2B0A9] mb-1.5">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                    }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl bg-[#08120D] border text-xs text-[#F2F7F4] placeholder-[#506359] focus:outline-none focus:ring-1 transition-colors ${
                      errors.email
                        ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                        : 'border-[#193224] focus:border-[#2D6A4F] focus:ring-[#2D6A4F]'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-[11px] text-[#E07A70] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="text-xs font-medium text-[#A2B0A9]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#506359]">Minimum 8 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="••••••••••••"
                      className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#08120D] border text-xs text-[#F2F7F4] placeholder-[#506359] focus:outline-none focus:ring-1 transition-colors ${
                        errors.password
                          ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                          : 'border-[#193224] focus:border-[#2D6A4F] focus:ring-[#2D6A4F]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#74968C] hover:text-[#FFFFFF] transition-colors p-0.5 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-[11px] text-[#E07A70] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1B4332] text-[#FFFFFF] text-xs font-medium hover:bg-[#255C45] active:scale-98 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Direct Demo Bypass Action */}
              <div className="mt-4 pt-4 border-t border-[#14261D] text-center">
                <button
                  type="button"
                  onClick={handleEnterDemo}
                  className="text-xs text-[#74968C] hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore sample account directly (/app)</span>
                </button>
              </div>
            </div>

            {/* Switch to Register */}
            <div className="mt-8 pt-4 border-t border-[#14261D] text-center text-xs text-[#8B9E94]">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="text-[#A3B8B0] font-medium hover:text-[#FFFFFF] underline transition-colors">
                Create one here
              </Link>
            </div>
          </div>

          {/* Editorial Visual Statement Side (5 cols, desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#08120D] p-10 border-l border-[#193224] flex-col justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#1B4332]/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="font-mono text-[10px] text-[#74968C] uppercase tracking-wider block mb-2">
                FINANCIAL SNAPSHOT // DEMO
              </span>
              <h2 className="text-xl font-serif text-[#FFFFFF]">
                Understand where your money goes.
              </h2>
              <p className="text-xs text-[#8B9E94] mt-1.5 leading-relaxed">
                SpendSleuth continuously checks your income and expenses to surface repeated bills and savings opportunities.
              </p>

              {/* Mini Illustrative INR Card */}
              <div className="mt-8 p-5 rounded-2xl bg-[#0D1A14] border border-[#193224] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#193224]">
                  <span className="text-[11px] font-mono text-[#74968C]">MONTHLY OVERVIEW</span>
                  <span className="text-[10px] font-mono text-[#2D6A4F] bg-[#142B20] px-2 py-0.5 rounded">
                    APRIL 2026
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B9E94]">Estimated Expenses</span>
                    <span className="font-mono font-medium text-[#FFFFFF]">{formatCurrency(48650)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B9E94]">Monthly Subscriptions</span>
                    <span className="font-mono font-medium text-[#74968C]">{formatCurrency(2450)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B9E94]">Potential Savings</span>
                    <span className="font-mono font-medium text-[#4EAC85]">+{formatCurrency(5800)}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#506359] font-mono">
              SpendSleuth • Indian Rupee (₹) Standard
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="px-6 py-4 border-t border-[#14261D] text-center text-xs text-[#506359]">
        © 2026 SpendSleuth. Personal Finance Intelligence. Private and secure.
      </footer>
    </div>
  )
}
