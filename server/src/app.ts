import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { authRouter } from './routes/authRoutes.js'
import { transactionRouter } from './routes/transactionRoutes.js'
import { reviewRouter } from './routes/reviewRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

// CORS configuration - strict origin with credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin in development)
      if (!origin || origin === env.FRONTEND_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`))
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
