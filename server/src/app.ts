import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { authRouter } from './routes/authRoutes.js'
import { transactionRouter } from './routes/transactionRoutes.js'
import { reviewRouter } from './routes/reviewRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

// Trust first proxy hop (Render edge / Vercel reverse proxy)
app.set('trust proxy', 1)

// CORS configuration - strict origin with credentials support
const normalizedAllowedOrigin = env.FRONTEND_ORIGIN.replace(/\/+$/, '')

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin in development)
      if (!origin) {
        callback(null, true)
        return
      }
      const normalizedOrigin = origin.replace(/\/+$/, '')
      if (
        normalizedOrigin === normalizedAllowedOrigin ||
        normalizedOrigin.startsWith('http://localhost:')
      ) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'finora-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// Application routes
app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/reviews', reviewRouter)

// 404 Catch-All for unknown API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: `API route "${req.originalUrl}" not found.`,
    code: 'NOT_FOUND',
  })
})

// Centralized error handler
app.use(errorHandler)
