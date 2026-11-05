import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User.js'
import { env } from '../config/env.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

function getCookieOptions(): {
  httpOnly: boolean
  secure: boolean
  sameSite: 'none' | 'lax'
  path: string
  domain?: string
} {
  const isProd = env.NODE_ENV === 'production'
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim()

  const options: {
    httpOnly: boolean
    secure: boolean
    sameSite: 'none' | 'lax'
    path: string
    domain?: string
  } = {
    httpOnly: true,
    secure: isProd,
    sameSite: cookieDomain ? 'lax' : isProd ? 'none' : 'lax',
    path: '/',
  }

  if (cookieDomain) {
    options.domain = cookieDomain
  }

  return options
}

function setSessionCookie(res: Response, token: string): void {
  const options = getCookieOptions()
  res.cookie('finora_session', token, {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

function clearSessionCookie(res: Response): void {
  const options = getCookieOptions()
  res.clearCookie('finora_session', options)
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, email, password } = req.body

    // Input sanitization and validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(400).json({ error: 'Full name must be at least 2 characters long.', code: 'INVALID_NAME' })
      return
    }

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'A valid email address is required.', code: 'INVALID_EMAIL' })
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.', code: 'INVALID_EMAIL_FORMAT' })
      return
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.', code: 'INVALID_PASSWORD' })
      return
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      res.status(409).json({
        error: 'An account with this email address already exists. Please log in.',
        code: 'EMAIL_ALREADY_EXISTS',
      })
      return
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    const token = generateToken(newUser)
    setSessionCookie(res, token)

    res.status(201).json({
      user: newUser.toJSON(),
      token, // Also return token in JSON for clients preferring Authorization header
      message: 'Account registered successfully.',
    })
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        error: 'An account with this email address already exists.',
        code: 'EMAIL_ALREADY_EXISTS',
      })
      return
    }
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.', code: 'MISSING_CREDENTIALS' })
      return
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' })
      return
    }

    const isMatch = await user.comparePassword(String(password))
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' })
      return
    }

    const token = generateToken(user)
    setSessionCookie(res, token)

    res.status(200).json({
      user: user.toJSON(),
      token,
      message: 'Signed in successfully.',
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearSessionCookie(res)
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  })
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized.', code: 'UNAUTHORIZED' })
      return
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404).json({ error: 'User account not found.', code: 'USER_NOT_FOUND' })
      return
    }

    const token = generateToken(user)
    res.status(200).json({
      user: user.toJSON(),
      token,
    })
  } catch (error) {
    next(error)
  }
}
