import { Router } from 'express'
import { register, login, logout, getMe } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

export const authRouter = Router()

authRouter.post('/register', authRateLimiter, register)
authRouter.post('/login', authRateLimiter, login)
authRouter.post('/logout', logout)
authRouter.get('/me', authMiddleware, getMe)
