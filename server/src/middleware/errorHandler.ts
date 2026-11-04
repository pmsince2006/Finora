import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.js'

export interface AppError extends Error {
  statusCode?: number
  code?: string | number
  errors?: Record<string, string>
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500)

  // Handle Mongoose / MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    res.status(409).json({
      error: 'A resource with this key or identifier already exists.',
      code: 'DUPLICATE_KEY',
    })
    return
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation failed. Please verify your submitted fields.',
      code: 'VALIDATION_ERROR',
      details: err.message,
    })
    return
  }

  // Safe client response for internal server errors
  if (env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[Finora Server Error]', err.message)
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'An unexpected server error occurred.' : err.message,
    code: err.code || 'SERVER_ERROR',
  })
}
