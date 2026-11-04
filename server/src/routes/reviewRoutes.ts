import { Router } from 'express'
import {
  getReviews,
  syncAllReviews,
  saveRecurringReview,
  removeRecurringReview,
  resetRecurringReviews,
  saveAnomalyReview,
  removeAnomalyReview,
  resetAnomalyReviews,
  saveSavingsReview,
  removeSavingsReview,
  resetSavingsReviews,
} from '../controllers/reviewController.js'
import { authMiddleware } from '../middleware/auth.js'

export const reviewRouter = Router()

// All review endpoints require authentication
reviewRouter.use(authMiddleware)

reviewRouter.get('/', getReviews)
reviewRouter.post('/sync', syncAllReviews)

// Recurring reviews
reviewRouter.post('/recurring', saveRecurringReview)
reviewRouter.delete('/recurring/:key', removeRecurringReview)
reviewRouter.delete('/recurring', resetRecurringReviews)

// Anomaly reviews
reviewRouter.post('/anomaly', saveAnomalyReview)
reviewRouter.delete('/anomaly/:key', removeAnomalyReview)
reviewRouter.delete('/anomaly', resetAnomalyReviews)

// Savings reviews
reviewRouter.post('/savings', saveSavingsReview)
reviewRouter.delete('/savings/:key', removeSavingsReview)
reviewRouter.delete('/savings', resetSavingsReviews)
