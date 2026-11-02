import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Check } from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'
import { validateRegistration } from '../services/authService'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    const validation = validateRegistration(fullName, email, password, confirmPassword)
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
        'Account details verified. Persistent user accounts will be created when the server database is connected. You can test the full interactive demo workspace below right now.'
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
              <div className="mb-6">
                <span className="text-[11px] font-mono tracking-wider text-[#74968C] uppercase block mb-1">
                  GET STARTED
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#FFFFFF] tracking-tight">
                  Start understanding your money.
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#8B9E94] leading-relaxed">
                  Create a private account to import transactions, find repeat bills, and explore realistic ways to save.
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-medium text-[#A2B0A9] mb-1.5">
                    Your name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }))
                    }}
                    placeholder="Alex Morrison"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#08120D] border text-xs text-[#F2F7F4] placeholder-[#506359] focus:outline-none focus:ring-1 transition-colors ${
                      errors.fullName
                        ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                        : 'border-[#193224] focus:border-[#2D6A4F] focus:ring-[#2D6A4F]'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] text-[#E07A70] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-[#A2B0A9] mb-1.5">
                    Email address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                    }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#08120D] border text-xs text-[#F2F7F4] placeholder-[#506359] focus:outline-none focus:ring-1 transition-colors ${
                      errors.email
                        ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                        : 'border-[#193224] focus:border-[#2D6A4F] focus:ring-[#2D6A4F]'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-[#E07A70] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-medium text-[#A2B0A9] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                        }}
                        placeholder="••••••••••••"
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-[#08120D] border text-xs text-[#F2F7F4] placeholder-[#506359] focus:outline-none focus:ring-1 transition-colors ${
                          errors.password
                            ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                            : 'border-[#193224] focus:border-[#2D6A4F] focus:ring-[#2D6A4F]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#74968C] hover:text-[#FFFFFF] transition-colors p-0.5 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-[11px] text-[#E07A70] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reg-confirm-password" className="block text-xs font-medium text-[#A2B0A9] mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                        }}
                        placeholder="••••••••••••"
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-[#08120D] border text-xs text-[#F2F7F4] placeholder-[#506359] focus:outline-none focus:ring-1 transition-colors ${
                          errors.confirmPassword
                            ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                            : 'border-[#193224] focus:border-[#2D6A4F] focus:ring-[#2D6A4F]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-[#74968C] hover:text-[#FFFFFF] transition-colors p-0.5 cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-[11px] text-[#E07A70] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.confirmPassword}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1B4332] text-[#FFFFFF] text-xs font-medium hover:bg-[#255C45] active:scale-98 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Direct Demo Bypass Action */}
              <div className="mt-4 pt-3 border-t border-[#14261D] text-center">
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

            {/* Switch to Login */}
            <div className="mt-6 pt-4 border-t border-[#14261D] text-center text-xs text-[#8B9E94]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#A3B8B0] font-medium hover:text-[#FFFFFF] underline transition-colors">
                Log in here
              </Link>
            </div>
          </div>

          {/* Editorial Visual Statement Side (5 cols, desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#08120D] p-10 border-l border-[#193224] flex-col justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#1B4332]/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="font-mono text-[10px] text-[#74968C] uppercase tracking-wider block mb-2">
                WHAT YOU GET
              </span>
              <h2 className="text-xl font-serif text-[#FFFFFF]">
                A clear, calm view of your finances.
              </h2>
              <p className="text-xs text-[#8B9E94] mt-1.5 leading-relaxed">
                SpendSleuth helps students and early career professionals build lasting financial clarity.
              </p>

              {/* 3 Core Points in simple language */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#142B20] text-[#74968C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#FFFFFF] block">Single transaction ledger</span>
                    <span className="text-[11px] text-[#8B9E94]">
                      Add entries manually or import files without bank login credentials.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#142B20] text-[#74968C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#FFFFFF] block">Find repeated payments</span>
                    <span className="text-[11px] text-[#8B9E94]">
                      Identify active monthly and annual subscriptions with estimated totals.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#142B20] text-[#74968C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#FFFFFF] block">Test monthly savings</span>
                    <span className="text-[11px] text-[#8B9E94]">
                      Estimate realistic monthly savings before changing your spending habits.
                    </span>
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
