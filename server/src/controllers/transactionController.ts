import { Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { TransactionModel } from '../models/Transaction.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

function validateTxPayload(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Transaction payload must be an object.' }
  }

  if (typeof body.description !== 'string' || body.description.trim().length === 0) {
    return { isValid: false, error: 'Transaction description is required.' }
  }

  const amount = Number(body.amount)
  if (isNaN(amount) || !isFinite(amount) || amount < 0) {
    return { isValid: false, error: 'Transaction amount must be a positive number or zero.' }
  }

  if (body.type !== 'income' && body.type !== 'expense') {
    return { isValid: false, error: 'Transaction type must be "income" or "expense".' }
  }

  if (typeof body.category !== 'string' || body.category.trim().length === 0) {
    return { isValid: false, error: 'Transaction category is required.' }
  }

  if (typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date.slice(0, 10))) {
    return { isValid: false, error: 'Transaction date must be formatted as YYYY-MM-DD.' }
  }

  const parsedDate = new Date(body.date)
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Transaction date is invalid.' }
  }

  return { isValid: true }
}

export async function listTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const transactions = await TransactionModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1, createdAt: -1 })
      .lean()

    const sanitized = transactions.map((t) => {
      const { _id, __v, userId: _, ...rest } = t as any
      return rest
    })

    res.status(200).json({ transactions: sanitized })
  } catch (error) {
    next(error)
  }
}

export async function createTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const validation = validateTxPayload(req.body)
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error, code: 'INVALID_TRANSACTION_DATA' })
      return
    }

    const txId =
      typeof req.body.id === 'string' && req.body.id.trim().length > 0
        ? req.body.id.trim()
        : `tx-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    // Check if this user already has a transaction with this exact ID
    const existing = await TransactionModel.findOne({
      userId: new Types.ObjectId(userId),
      id: txId,
    })

    if (existing) {
      res.status(409).json({ error: 'A transaction with this ID already exists.', code: 'DUPLICATE_TX_ID' })
      return
    }

    const created = await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      id: txId,
      description: req.body.description.trim(),
      amount: Math.round(Number(req.body.amount) * 100) / 100,
      type: req.body.type,
      category: req.body.category.trim(),
      date: req.body.date.slice(0, 10),
      notes: typeof req.body.notes === 'string' ? req.body.notes.trim() : undefined,
      account: typeof req.body.account === 'string' ? req.body.account.trim() : undefined,
      status: req.body.status || 'regular',
      isRecurringCandidate: Boolean(req.body.isRecurringCandidate),
      recurringCadence: req.body.recurringCadence,
      confidence: typeof req.body.confidence === 'number' ? req.body.confidence : undefined,
      isAnomaly: Boolean(req.body.isAnomaly),
      anomalySeverity: req.body.anomalySeverity,
      anomalyReason: req.body.anomalyReason,
      baselineAmount: req.body.baselineAmount,
    })

    res.status(201).json({ transaction: created.toJSON() })
  } catch (error) {
    next(error)
  }
}

export async function batchCreateTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const items = req.body.transactions

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Transactions array is required and must not be empty.', code: 'INVALID_BATCH' })
      return
    }

    const validDocs = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const validation = validateTxPayload(item)
      if (validation.isValid) {
        const txId =
          typeof item.id === 'string' && item.id.trim().length > 0
            ? item.id.trim()
            : `tx-import-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`

        validDocs.push({
          userId: new Types.ObjectId(userId),
          id: txId,
          description: item.description.trim(),
          amount: Math.round(Number(item.amount) * 100) / 100,
          type: item.type,
          category: item.category.trim(),
          date: item.date.slice(0, 10),
          notes: typeof item.notes === 'string' ? item.notes.trim() : undefined,
          account: typeof item.account === 'string' ? item.account.trim() : undefined,
          status: item.status || 'regular',
        })
      }
    }

    if (validDocs.length === 0) {
      res.status(400).json({ error: 'No valid transaction records found in payload.', code: 'NO_VALID_DATA' })
      return
    }

    // Insert records, ignoring duplicates with ordered: false
    const inserted = await TransactionModel.insertMany(validDocs, { ordered: false })
    const sanitized = inserted.map((doc) => doc.toJSON())

    res.status(201).json({
      importedCount: sanitized.length,
      transactions: sanitized,
    })
  } catch (error: any) {
    // If some succeeded in bulk insert
    if (error.insertedDocs && error.insertedDocs.length > 0) {
      const sanitized = error.insertedDocs.map((doc: any) => {
        const { _id, __v, userId: _, ...rest } = doc.toObject ? doc.toObject() : doc
        return rest
      })
      res.status(201).json({
        importedCount: sanitized.length,
        transactions: sanitized,
      })
      return
    }
    next(error)
  }
}

export async function updateTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const txId = req.params.id

    const validation = validateTxPayload(req.body)
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error, code: 'INVALID_TRANSACTION_DATA' })
      return
    }

    const updated = await TransactionModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), id: txId },
      {
        $set: {
          description: req.body.description.trim(),
          amount: Math.round(Number(req.body.amount) * 100) / 100,
          type: req.body.type,
          category: req.body.category.trim(),
          date: req.body.date.slice(0, 10),
          notes: typeof req.body.notes === 'string' ? req.body.notes.trim() : undefined,
          account: typeof req.body.account === 'string' ? req.body.account.trim() : undefined,
          status: req.body.status,
        },
      },
      { new: true }
    )

    if (!updated) {
      res.status(404).json({ error: 'Transaction not found or not owned by authenticated user.', code: 'TX_NOT_FOUND' })
      return
    }

    res.status(200).json({ transaction: updated.toJSON() })
  } catch (error) {
    next(error)
  }
}

export async function deleteTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const txId = req.params.id

    const deleted = await TransactionModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      id: txId,
    })

    if (!deleted) {
      res.status(404).json({ error: 'Transaction not found or not owned by authenticated user.', code: 'TX_NOT_FOUND' })
      return
    }

    res.status(200).json({
      success: true,
      deletedTransaction: deleted.toJSON(),
      message: 'Transaction deleted successfully.',
    })
  } catch (error) {
    next(error)
  }
}

export async function clearAllTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const result = await TransactionModel.deleteMany({ userId: new Types.ObjectId(userId) })
    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: 'All transactions cleared for user.',
    })
  } catch (error) {
    next(error)
  }
}
