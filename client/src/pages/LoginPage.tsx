import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'
import { validateLogin } from '../services/authService'
import { AuthShell } from '../components/auth/AuthShell'
import { useAuth } from '../context/useAuth'
import { ApiError } from '../lib/api'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    const validation = validateLogin(email, password)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Invalid email or password. Please try again.'
      setErrors({ form: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterDemo = () => {
    navigate('/app')
  }

  return (
    <AuthShell maxWidth="max-w-[440px]">
      {/* Top Bar: Brand Logo & Back to Home */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
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
      <div className="mb-4 sm:mb-5">
        <span className="text-[10px] font-mono tracking-wider text-[#74968C] uppercase block mb-1">
          MEMBER ACCESS
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-1 text-xs text-[#8B9E94] leading-relaxed">
          Log in to review transactions, recurring payments, and active savings goals.
        </p>
      </div>

      {/* Status Notice if submitted */}
      {statusMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#142B20]/90 border border-[#234D39] text-xs text-[#E3ECE8] space-y-2.5">
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
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#10b981] text-[#041F14] text-xs font-semibold hover:bg-[#34d399] transition-all cursor-pointer shadow-xs"
          >
            <span>Enter Interactive Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error message from server */}
      {errors.form && (
        <div className="mb-4 p-3 rounded-xl bg-[#2D1214]/90 border border-[#7F1D1D] text-xs text-[#FCA5A5] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-[11px] font-medium text-[#C0CCC5] mb-1">
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
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#060D09]/90 border text-xs text-[#F2F7F4] placeholder-[#46584E] focus:outline-none focus:ring-1 transition-colors ${
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

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="text-[11px] font-medium text-[#C0CCC5]">
              Password
            </label>
            <span className="text-[10px] text-[#506359]">Min. 8 characters</span>
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
              className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#060D09]/90 border text-xs text-[#F2F7F4] placeholder-[#46584E] focus:outline-none focus:ring-1 transition-colors ${
                errors.password
                  ? 'border-[#B83A2E] focus:ring-[#B83A2E]'
                  : 'border-[#1C3628] focus:border-[#10b981] focus:ring-[#10b981]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[#74968C] hover:text-white transition-colors p-0.5 cursor-pointer"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-[#10b981] text-[#041F14] text-xs sm:text-sm font-semibold hover:bg-[#34d399] active:scale-[0.99] transition-all shadow-[0_2px_12px_rgba(16,185,129,0.25)] cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Direct Demo Bypass Action */}
      <div className="mt-3.5 pt-3 border-t border-[#14261D] text-center">
        <button
          type="button"
          onClick={handleEnterDemo}
          className="text-xs text-[#74968C] hover:text-[#34d399] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Explore sample account directly (/app)</span>
        </button>
      </div>

      {/* Switch to Register */}
      <div className="mt-4 pt-3 border-t border-[#14261D] text-center text-xs text-[#8B9E94]">
        Don&apos;t have an account yet?{' '}
        <Link to="/register" className="text-[#10b981] font-medium hover:text-[#34d399] underline transition-colors">
          Create one here
        </Link>
      </div>
    </AuthShell>
  )
}
