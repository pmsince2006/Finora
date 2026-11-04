import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IRecurringReview {
  candidateKey: string
  status: 'confirmed' | 'dismissed'
  reviewedAt: string
  userNotes?: string
}

export interface IAnomalyReview {
  findingKey: string
  transactionId: string
  status: 'reviewed' | 'dismissed'
  reviewedAt: string
  userNotes?: string
}

export interface ISavingsReview {
  opportunityKey: string
  status: 'saved' | 'planned' | 'completed' | 'dismissed'
  reviewedAt: string
  userNotes?: string
  customTargetPercent?: number
}

export interface IReviewStateDocument extends Document {
  userId: Types.ObjectId
  recurringReviews: Record<string, IRecurringReview>
  anomalyReviews: Record<string, IAnomalyReview>
  savingsReviews: Record<string, ISavingsReview>
  createdAt: Date
  updatedAt: Date
}

const ReviewStateSchema = new Schema<IReviewStateDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    recurringReviews: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    anomalyReviews: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    savingsReviews: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
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

export const ReviewStateModel = mongoose.model<IReviewStateDocument>('ReviewState', ReviewStateSchema)
