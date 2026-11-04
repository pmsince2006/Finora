import { Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { ReviewStateModel } from '../models/ReviewState.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

async function getOrCreateReviewDoc(userId: string) {
  let doc = await ReviewStateModel.findOne({ userId: new Types.ObjectId(userId) })
  if (!doc) {
    doc = await ReviewStateModel.create({
      userId: new Types.ObjectId(userId),
      recurringReviews: {},
      anomalyReviews: {},
      savingsReviews: {},
    })
  }
  return doc
}

export async function getReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await getOrCreateReviewDoc(req.user!.id)
    res.status(200).json({
      recurringReviews: doc.recurringReviews || {},
      anomalyReviews: doc.anomalyReviews || {},
      savingsReviews: doc.savingsReviews || {},
    })
  } catch (error) {
    next(error)
  }
}

export async function syncAllReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { recurringReviews, anomalyReviews, savingsReviews } = req.body
    const doc = await getOrCreateReviewDoc(req.user!.id)

    if (recurringReviews && typeof recurringReviews === 'object') {
      doc.recurringReviews = { ...doc.recurringReviews, ...recurringReviews }
    }
    if (anomalyReviews && typeof anomalyReviews === 'object') {
      doc.anomalyReviews = { ...doc.anomalyReviews, ...anomalyReviews }
    }
    if (savingsReviews && typeof savingsReviews === 'object') {
      doc.savingsReviews = { ...doc.savingsReviews, ...savingsReviews }
    }

    doc.markModified('recurringReviews')
    doc.markModified('anomalyReviews')
    doc.markModified('savingsReviews')
    await doc.save()

    res.status(200).json({
      recurringReviews: doc.recurringReviews,
      anomalyReviews: doc.anomalyReviews,
      savingsReviews: doc.savingsReviews,
      message: 'Review states synchronized successfully.',
    })
  } catch (error) {
    next(error)
  }
}

export async function saveRecurringReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { candidateKey, status, reviewedAt, userNotes } = req.body
    if (!candidateKey || !status) {
      res.status(400).json({ error: 'candidateKey and status are required.', code: 'INVALID_INPUT' })
      return
    }

    const doc = await getOrCreateReviewDoc(req.user!.id)
    const reviews = doc.recurringReviews || {}
    reviews[candidateKey] = {
      candidateKey,
      status,
      reviewedAt: reviewedAt || new Date().toISOString(),
      userNotes,
    }
    doc.recurringReviews = reviews
    doc.markModified('recurringReviews')
    await doc.save()

    res.status(200).json({ recurringReviews: doc.recurringReviews })
  } catch (error) {
    next(error)
  }
}

export async function removeRecurringReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { key } = req.params
    const doc = await getOrCreateReviewDoc(req.user!.id)
    if (doc.recurringReviews && doc.recurringReviews[key]) {
      delete doc.recurringReviews[key]
      doc.markModified('recurringReviews')
      await doc.save()
    }
    res.status(200).json({ recurringReviews: doc.recurringReviews })
  } catch (error) {
    next(error)
  }
}

export async function resetRecurringReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await getOrCreateReviewDoc(req.user!.id)
    doc.recurringReviews = {}
    doc.markModified('recurringReviews')
    await doc.save()
    res.status(200).json({ recurringReviews: {} })
  } catch (error) {
    next(error)
  }
}

export async function saveAnomalyReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { findingKey, transactionId, status, reviewedAt, userNotes } = req.body
    if (!findingKey || !status) {
      res.status(400).json({ error: 'findingKey and status are required.', code: 'INVALID_INPUT' })
      return
    }

    const doc = await getOrCreateReviewDoc(req.user!.id)
    const reviews = doc.anomalyReviews || {}
    reviews[findingKey] = {
      findingKey,
      transactionId: transactionId || findingKey.replace(/^anom-/, '').replace(/-[^-]+$/, ''),
      status,
      reviewedAt: reviewedAt || new Date().toISOString(),
      userNotes,
    }
    doc.anomalyReviews = reviews
    doc.markModified('anomalyReviews')
    await doc.save()

    res.status(200).json({ anomalyReviews: doc.anomalyReviews })
  } catch (error) {
    next(error)
  }
}

export async function removeAnomalyReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { key } = req.params
    const doc = await getOrCreateReviewDoc(req.user!.id)
    if (doc.anomalyReviews && doc.anomalyReviews[key]) {
      delete doc.anomalyReviews[key]
      doc.markModified('anomalyReviews')
      await doc.save()
    }
    res.status(200).json({ anomalyReviews: doc.anomalyReviews })
  } catch (error) {
    next(error)
  }
}

export async function resetAnomalyReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await getOrCreateReviewDoc(req.user!.id)
    doc.anomalyReviews = {}
    doc.markModified('anomalyReviews')
    await doc.save()
    res.status(200).json({ anomalyReviews: {} })
  } catch (error) {
    next(error)
  }
}

export async function saveSavingsReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { opportunityKey, status, reviewedAt, userNotes, customTargetPercent } = req.body
    if (!opportunityKey || !status) {
      res.status(400).json({ error: 'opportunityKey and status are required.', code: 'INVALID_INPUT' })
      return
    }

    const doc = await getOrCreateReviewDoc(req.user!.id)
    const reviews = doc.savingsReviews || {}
    reviews[opportunityKey] = {
      opportunityKey,
      status,
      reviewedAt: reviewedAt || new Date().toISOString(),
      userNotes,
      customTargetPercent,
    }
    doc.savingsReviews = reviews
    doc.markModified('savingsReviews')
    await doc.save()

    res.status(200).json({ savingsReviews: doc.savingsReviews })
  } catch (error) {
    next(error)
  }
}

export async function removeSavingsReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { key } = req.params
    const doc = await getOrCreateReviewDoc(req.user!.id)
    if (doc.savingsReviews && doc.savingsReviews[key]) {
      delete doc.savingsReviews[key]
      doc.markModified('savingsReviews')
      await doc.save()
    }
    res.status(200).json({ savingsReviews: doc.savingsReviews })
  } catch (error) {
    next(error)
  }
}

export async function resetSavingsReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await getOrCreateReviewDoc(req.user!.id)
    doc.savingsReviews = {}
    doc.markModified('savingsReviews')
    await doc.save()
    res.status(200).json({ savingsReviews: {} })
  } catch (error) {
    next(error)
  }
}
