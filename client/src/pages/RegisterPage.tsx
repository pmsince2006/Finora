import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'
import { validateRegistration } from '../services/authService'
import { AuthShell } from '../components/auth/AuthShell'

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
    <AuthShell maxWidth="max-w-[480px]">
      {/* Top Bar: Brand Logo & Back to Home */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Link to="/" className="inline-flex items-center gap-2 group focus:outline-none">
          <BrandLogo size="sm" inverted />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#74968C] hover:text-[#E3ECE8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Heading */}
      <div className="mb-3 sm:mb-4">
        <span className="text-[10px] font-mono tracking-wider text-[#74968C] uppercase block mb-1">
          GET STARTED
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
          Start understanding your money.
        </h1>
        <p className="mt-1 text-xs text-[#8B9E94] leading-relaxed">
          Create a private account to import transactions, find repeat bills, and explore savings.
        </p>
      </div>

      {/* Status Notice if submitted */}
      {statusMessage && (
        <div className="mb-3 p-3 rounded-xl bg-[#142B20]/90 border border-[#234D39] text-xs text-[#E3ECE8] space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-white text-xs">Local Preview Active</span>
              <p className="text-[11px] text-[#A2B0A9] mt-0.5 leading-relaxed">
                {statusMessage}
              </p>
            </div>
          </div>
          <button
            onClick={handleEnterDemo}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981] text-[#041F14] text-xs font-semibold hover:bg-[#34d399] transition-all cursor-pointer shadow-xs"
          >
            <span>Enter Interactive Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
        <div>
          <label htmlFor="reg-name" className="block text-[11px] font-medium text-[#C0CCC5] mb-1">
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
            className={`w-full px-3 py-2 sm:py-2.5 rounded-xl bg-[#060D09]/90 border text-xs text-[#F2F7F4] placeholder-[#46584E] focus:outline-none focus:ring-1 transition-colors ${
              errors.fullName
                ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                : 'border-[#1C3628] focus:border-[#10b981] focus:ring-[#10b981]'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-[11px] text-[#F87171] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-[11px] font-medium text-[#C0CCC5] mb-1">
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
            className={`w-full px-3 py-2 sm:py-2.5 rounded-xl bg-[#060D09]/90 border text-xs text-[#F2F7F4] placeholder-[#46584E] focus:outline-none focus:ring-1 transition-colors ${
              errors.email
                ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                : 'border-[#1C3628] focus:border-[#10b981] focus:ring-[#10b981]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-[#F87171] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          <div>
            <label htmlFor="reg-password" className="block text-[11px] font-medium text-[#C0CCC5] mb-1">
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
                className={`w-full px-3 py-2 sm:py-2.5 pr-9 rounded-xl bg-[#060D09]/90 border text-xs text-[#F2F7F4] placeholder-[#46584E] focus:outline-none focus:ring-1 transition-colors ${
                  errors.password
                    ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                    : 'border-[#1C3628] focus:border-[#10b981] focus:ring-[#10b981]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-[#74968C] hover:text-white transition-colors p-0.5 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-[#F87171] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-[11px] font-medium text-[#C0CCC5] mb-1">
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
                className={`w-full px-3 py-2 sm:py-2.5 pr-9 rounded-xl bg-[#060D09]/90 border text-xs text-[#F2F7F4] placeholder-[#46584E] focus:outline-none focus:ring-1 transition-colors ${
                  errors.confirmPassword
                    ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                    : 'border-[#1C3628] focus:border-[#10b981] focus:ring-[#10b981]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-2 text-[#74968C] hover:text-white transition-colors p-0.5 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] text-[#F87171] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 rounded-xl bg-[#10b981] text-[#041F14] text-xs sm:text-sm font-semibold hover:bg-[#34d399] active:scale-[0.99] transition-all shadow-[0_2px_12px_rgba(16,185,129,0.25)] cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Direct Demo Bypass Action */}
      <div className="mt-3 pt-2.5 border-t border-[#14261D] text-center">
        <button
          type="button"
          onClick={handleEnterDemo}
          className="text-xs text-[#74968C] hover:text-[#34d399] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Explore sample account directly (/app)</span>
        </button>
      </div>

      {/* Switch to Login */}
      <div className="mt-3 pt-2.5 border-t border-[#14261D] text-center text-xs text-[#8B9E94]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#10b981] font-medium hover:text-[#34d399] underline transition-colors">
          Log in here
        </Link>
      </div>
    </AuthShell>
  )
}
