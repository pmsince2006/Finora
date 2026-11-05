import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
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

// Health & Diagnostic endpoints

// Liveness probe: verifies process is alive and HTTP server is accepting requests
app.get('/api/health/live', (_req, res) => {
  res.status(200).json({
    status: 'live',
    service: 'finora-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Readiness probe: verifies MongoDB connection is established to serve data queries
app.get('/api/health/ready', (_req, res) => {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  const dbState = stateMap[mongoose.connection.readyState] || 'unknown'
  const isReady = mongoose.connection.readyState === 1

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    service: 'finora-backend',
    database: dbState,
    timestamp: new Date().toISOString(),
  })
})

// General health endpoint (returns 200 to prevent false-alarm container restarts)
app.get('/api/health', (_req, res) => {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  const dbState = stateMap[mongoose.connection.readyState] || 'unknown'

  res.status(200).json({
    status: 'ok',
    service: 'finora-backend',
    version: '1.0.0',
    database: dbState,
    uptime: process.uptime(),
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
