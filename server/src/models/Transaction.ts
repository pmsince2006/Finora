import mongoose, { Schema, Document, Types } from 'mongoose'

export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'verified' | 'flagged' | 'recurring' | 'regular'

export interface ITransactionDocument extends Document {
  userId: Types.ObjectId
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  date: string
  notes?: string
  account?: string
  status?: TransactionStatus
  isRecurringCandidate?: boolean
  recurringCadence?: string
  confidence?: number
  isAnomaly?: boolean
  anomalySeverity?: string
  anomalyReason?: string
  baselineAmount?: number
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive or zero'],
      validate: {
        validator: (v: number) => isFinite(v) && !isNaN(v),
        message: 'Amount must be a finite number',
      },
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type must be either income or expense'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    notes: { type: String, trim: true },
    account: { type: String, trim: true },
    status: {
      type: String,
      enum: ['verified', 'flagged', 'recurring', 'regular'],
      default: 'regular',
    },
    isRecurringCandidate: { type: Boolean, default: false },
    recurringCadence: { type: String },
    confidence: { type: Number },
    isAnomaly: { type: Boolean, default: false },
    anomalySeverity: { type: String },
    anomalyReason: { type: String },
    baselineAmount: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret._id
        delete ret.__v
        delete ret.userId
        return ret
      },
    },
  }
)

// User-scoped uniqueness for transaction IDs and performance index for time-series queries
TransactionSchema.index({ userId: 1, id: 1 }, { unique: true })
TransactionSchema.index({ userId: 1, date: -1 })

export const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema)
