import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface AuthUserPayload {
  id: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Check cookie first (primary secure transport), fallback to Authorization header
  let token: string | undefined = req.cookies?.finora_session

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. No session token provided.',
      code: 'AUTH_REQUIRED',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string }
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        error: 'Invalid session token.',
        code: 'INVALID_TOKEN',
      })
      return
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      })
      return
    }

    res.status(401).json({
      error: 'Authentication failed. Invalid session.',
      code: 'AUTH_FAILED',
    })
  }
}
