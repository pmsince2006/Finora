import { Router } from 'express'
import {
  listTransactions,
  createTransaction,
  batchCreateTransactions,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
} from '../controllers/transactionController.js'
import { authMiddleware } from '../middleware/auth.js'

export const transactionRouter = Router()

// All transaction endpoints require authentication
transactionRouter.use(authMiddleware)

transactionRouter.get('/', listTransactions)
transactionRouter.post('/', createTransaction)
transactionRouter.post('/batch', batchCreateTransactions)
transactionRouter.put('/:id', updateTransaction)
transactionRouter.delete('/:id', deleteTransaction)
transactionRouter.delete('/', clearAllTransactions)
